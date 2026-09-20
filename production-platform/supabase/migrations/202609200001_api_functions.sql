-- Supabase RPCs for application operations that require a single PostgreSQL transaction.

create or replace function create_practitioner(
  p_display_name text,
  p_email text,
  p_phone_normalized text,
  p_password_hash text,
  p_role "Role",
  p_profession text,
  p_regulator text,
  p_license_number_normalized text,
  p_license_expiry timestamptz
) returns "Practitioner"
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user "User";
  v_practitioner "Practitioner";
begin
  insert into "User" (id,"email","phoneNormalized","passwordHash","role","status","displayName","createdAt","updatedAt")
  values (gen_random_uuid()::text,p_email,p_phone_normalized,p_password_hash,p_role,'PENDING',p_display_name,now(),now())
  returning * into v_user;

  insert into "Practitioner" (id,"userId","profession","regulator","licenseNumberNormalized","licenseExpiry","identityStatus","createdAt","updatedAt")
  values (gen_random_uuid()::text,v_user.id,p_profession,p_regulator,p_license_number_normalized,p_license_expiry,'PENDING',now(),now())
  returning * into v_practitioner;

  return v_practitioner;
end;
$$;

grant execute on function create_practitioner(text,text,text,text,"Role",text,text,text,timestamptz) to service_role;

-- Transaction-critical API workflows
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.hajjmed_supply_requisition(
  p_requisition_id text,
  p_supplied_by_user_id text,
  p_items jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  req "Requisition"%ROWTYPE;
  issue jsonb;
  line "RequisitionItem"%ROWTYPE;
  stock "InventoryItem"%ROWTYPE;
  outstanding integer;
  complete boolean;
BEGIN
  SELECT * INTO req FROM "Requisition" WHERE id=p_requisition_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'REQUISITION_NOT_FOUND' USING ERRCODE='P0001'; END IF;
  IF req.status IN ('SUPPLIED','CANCELLED') THEN RAISE EXCEPTION 'REQUISITION_CLOSED' USING ERRCODE='P0001'; END IF;

  FOR issue IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO line FROM "RequisitionItem" WHERE id=issue->>'requisition_item_id' AND "requisitionId"=p_requisition_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'REQUISITION_ITEM_MISMATCH' USING ERRCODE='P0001'; END IF;
    IF (issue->>'quantity')::integer > line."requestedQuantity"-line."suppliedQuantity" THEN RAISE EXCEPTION 'SUPPLY_EXCEEDS_REQUEST' USING ERRCODE='P0001'; END IF;
    SELECT * INTO stock FROM "InventoryItem" WHERE id=line."inventoryItemId" FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'INVENTORY_ITEM_NOT_FOUND' USING ERRCODE='P0001'; END IF;
    IF (issue->>'quantity')::integer > stock.quantity THEN RAISE EXCEPTION 'INSUFFICIENT_STOCK' USING ERRCODE='P0001'; END IF;
    UPDATE "InventoryItem" SET quantity=quantity-(issue->>'quantity')::integer, "updatedAt"=now() WHERE id=stock.id;
    UPDATE "RequisitionItem" SET "suppliedQuantity"="suppliedQuantity"+(issue->>'quantity')::integer WHERE id=line.id;
  END LOOP;

  SELECT NOT EXISTS (SELECT 1 FROM "RequisitionItem" WHERE "requisitionId"=p_requisition_id AND "suppliedQuantity"<"requestedQuantity") INTO complete;
  UPDATE "Requisition" SET status=CASE WHEN complete THEN 'SUPPLIED' ELSE 'PART_SUPPLIED' END, "suppliedByUserId"=p_supplied_by_user_id, "suppliedAt"=now(), "updatedAt"=now() WHERE id=p_requisition_id RETURNING * INTO req;

  RETURN jsonb_build_object('requisition', to_jsonb(req), 'items', COALESCE((SELECT jsonb_agg(jsonb_build_object('id',ri.id,'requisitionId',ri."requisitionId",'inventoryItemId',ri."inventoryItemId",'requestedQuantity',ri."requestedQuantity",'suppliedQuantity',ri."suppliedQuantity",'inventoryItem',to_jsonb(ii)) FROM "RequisitionItem" ri JOIN "InventoryItem" ii ON ii.id=ri."inventoryItemId" WHERE ri."requisitionId"=p_requisition_id), '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.hajjmed_append_audit_event(
  p_action "AuditAction",
  p_actor_user_id text,
  p_actor_role "Role",
  p_subject_type text,
  p_subject_id text,
  p_patient_id text,
  p_reason text,
  p_metadata jsonb,
  p_ip_address text,
  p_request_id text,
  p_occurred_at timestamptz
)
RETURNS "AuditEvent"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev text;
  new_id text := gen_random_uuid()::text;
  payload jsonb;
  h text;
  result "AuditEvent";
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('hajjmed-audit-chain', 0));
  SELECT "eventHash" INTO prev FROM "AuditEvent" ORDER BY "occurredAt" DESC, id DESC LIMIT 1;
  payload := jsonb_build_object('action',p_action,'subjectType',p_subject_type,'subjectId',p_subject_id,'patientId',p_patient_id,'reason',p_reason,'metadata',COALESCE(p_metadata,'{}'::jsonb),'actorUserId',p_actor_user_id,'actorRole',p_actor_role,'requestId',p_request_id,'occurredAt',p_occurred_at,'previousHash',prev);
  h := encode(digest(convert_to(payload::text,'utf8'),'sha256'),'hex');
  INSERT INTO "AuditEvent"(id,action,"actorUserId","actorRole","subjectType","subjectId","patientId",reason,metadata,"ipAddress","requestId","occurredAt","previousHash","eventHash")
  VALUES(new_id,p_action,p_actor_user_id,p_actor_role,p_subject_type,p_subject_id,p_patient_id,p_reason,COALESCE(p_metadata,'{}'::jsonb),p_ip_address,p_request_id,p_occurred_at,prev,h)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.hajjmed_batch_create_appointments_v2(
  p_facility_id text,
  p_booked_by_user_id text,
  p_purpose "AppointmentPurpose",
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_appointments jsonb,
  p_capacity_by_region jsonb
)
RETURNS SETOF "Appointment"
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record; item jsonb; needed integer; used integer; lim integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Facility" WHERE id=p_facility_id AND active=true) THEN RAISE EXCEPTION 'FACILITY_INACTIVE'; END IF;
  FOR r IN SELECT DISTINCT x.region FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text) ORDER BY x.region LOOP
    PERFORM pg_advisory_xact_lock(hashtextextended(r.region || '|' || p_starts_at::text, 0));
  END LOOP;
  IF (SELECT count(*) FROM "Appointment" a WHERE a.idempotencyKey IN (SELECT x.idempotency_key FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text))) = jsonb_array_length(p_appointments) THEN
    RETURN QUERY SELECT a.* FROM "Appointment" a WHERE a.idempotencyKey IN (SELECT x.idempotency_key FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text)) ORDER BY a.createdAt;
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text) JOIN "Appointment" a ON a.pilgrimId=x.pilgrim_id WHERE a.status <> 'CANCELLED') THEN RAISE EXCEPTION 'DUPLICATE_APPOINTMENT'; END IF;
  FOR r IN SELECT x.region FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text) GROUP BY x.region LOOP
    SELECT count(*) INTO needed FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text) WHERE x.region=r.region;
    SELECT count(*) INTO used FROM "Appointment" a WHERE a.region=r.region AND a.startsAt=p_starts_at AND a.status IN ('CONFIRMED','CHECKED_IN') AND a.category='SCHEDULED' AND (a.purpose=p_purpose OR (p_purpose='SCREENING' AND a.purpose='SCREENING_AND_VACCINATION') OR (p_purpose='VACCINATION' AND a.purpose='SCREENING_AND_VACCINATION'));
    lim := COALESCE((p_capacity_by_region->>r.region)::integer, 0);
    IF used + needed > lim THEN RAISE EXCEPTION 'CAPACITY_REACHED'; END IF;
  END LOOP;
  FOR item IN SELECT value FROM jsonb_array_elements(p_appointments) LOOP
    INSERT INTO "Appointment"("id","reference","pilgrimId","facilityId","purpose","category","status","region","startsAt","endsAt","idempotencyKey","bookedByUserId","createdAt","updatedAt") VALUES (COALESCE(item->>'id',gen_random_uuid()::text),item->>'reference',item->>'pilgrim_id',p_facility_id,p_purpose,'SCHEDULED','CONFIRMED',item->>'region',p_starts_at,p_ends_at,item->>'idempotency_key',p_booked_by_user_id,now(),now());
  END LOOP;
  RETURN QUERY SELECT a.* FROM "Appointment" a WHERE a.idempotencyKey IN (SELECT x.idempotency_key FROM jsonb_to_recordset(p_appointments) AS x(pilgrim_id text, region text, reference text, idempotency_key text)) ORDER BY a.createdAt;
END;
$$;
