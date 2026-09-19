# Database design gates

This checklist governs schema changes before they are migrated to validation or production.

## Current baseline

- [x] One table per core entity or relationship: users, pilgrims, facilities, appointments, clinical records, inventory, communications and audit events.
- [x] Repeating requisition items are represented by `RequisitionItem`, not repeated columns.
- [x] Natural identifiers have unique constraints where required: email, phone, passport, facility name, appointment reference, inventory code and idempotency keys.
- [x] Frequently filtered foreign-key columns have indexes for the current access patterns.
- [x] Migrations are versioned and must not be edited after application.

## First normal form and atomicity

Before adding a column, confirm that it contains one value for one fact in one row.

- [ ] Do not store comma-separated lists, repeated values or embedded records in scalar columns.
- [ ] Use child tables for repeating clinical values, coded findings, care-plan selections and inventory lines when those values need independent search, validation, auditing or reporting.
- [ ] Keep JSON only for versioned, opaque payloads whose internal properties are not independently queried or constrained.
- [ ] Every JSON field must have a documented schema version and validation at the API boundary.

Current JSON exceptions requiring an explicit decision before production data:

- `CarePlan.selections`
- `Screening.positiveFindings`
- `Screening.regulatoryExclusionCodes`
- `Screening.regulatoryExclusionEvidence`
- `Encounter.diagnosisCodes`
- `Encounter.interventions`
- `AuditEvent.metadata`
- `Notification.payload`

## Referential integrity

- [ ] Every stored reference to another entity is either a declared Prisma relation with a foreign key or is explicitly documented as an external identifier.
- [ ] Add relations for actor, reviewer, authorizer, performer and requester IDs before those workflows are used with real data.
- [ ] Choose delete behavior deliberately. Clinical and audit records should normally be retained; use status or archival fields instead of cascading deletes.
- [ ] Use `onDelete: Cascade` only for true owned child records, such as requisition lines owned by a requisition.

## Scalability and consistency

- [ ] Use UUID primary keys and immutable business references.
- [ ] Add composite indexes from measured query patterns, not speculation.
- [ ] Use unique constraints for idempotency and duplicate prevention.
- [ ] Use optimistic concurrency fields where concurrent updates are possible.
- [ ] Keep transactional writes together for capacity, dispensing and other inventory-sensitive operations.
- [ ] Avoid storing derived totals as authoritative values unless the update transaction maintains them.
- [ ] Record timestamps in UTC and use `Date` only for date-only business concepts.

## Migration gate

- [ ] Review the schema change and generated SQL.
- [ ] Run Prisma validation and application tests.
- [ ] Rehearse the migration against a copy of the target database.
- [ ] Take and verify a backup before applying to production.
- [ ] Run post-migration row-count, constraint and foreign-key checks.
- [ ] Record rollback steps and the migration evidence.

## Supabase cutover gate

- [ ] Apply the normalized schema through a reviewed SQL migration; do not create production tables manually from route code.
- [ ] Enable row-level security on application tables and document the policies for pilgrim, agent, clinician, administrator and medical-director access.
- [ ] Keep the service-role key exclusively in the API runtime; never expose it to web, mobile or client-side bundles.
- [ ] Verify every API write has a foreign-key, unique-constraint and audit strategy before enabling the Supabase path.
- [ ] Compare Supabase and Prisma row counts plus representative records during the dual-read period.
- [ ] Test Supabase failure, timeout and rollback behavior before removing the Prisma fallback.

## Creation order

1. Organization and User identity tables
2. Practitioner and authentication/session tables
3. Pilgrim and Facility tables
4. Appointment and capacity tables
5. Screening and encounter tables
6. Allergy, medication, immunization and document tables
7. Communication and care-plan tables
8. Notification and audit tables
9. Inventory, requisition and dispensing tables

The Prisma migrations already express this order. Apply them with Prisma; do not create the tables manually one at a time.
