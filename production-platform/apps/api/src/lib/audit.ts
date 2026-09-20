import type { FastifyRequest } from 'fastify';
import { requireSupabase } from './supabase.js';
import type { AuditAction, Role } from './db-types.js';

export async function audit(request: FastifyRequest, input: {action:AuditAction;subjectType:string;subjectId?:string;patientId?:string;reason?:string;metadata?:Record<string,unknown>}) {
  const actor=request.user as undefined|{sub:string;role:Role};
  const occurredAt=new Date().toISOString();
  const {data,error}=await requireSupabase().rpc('hajjmed_append_audit_event',{
    p_action:input.action,
    p_actor_user_id:actor?.sub ?? null,
    p_actor_role:actor?.role ?? null,
    p_subject_type:input.subjectType,
    p_subject_id:input.subjectId ?? null,
    p_patient_id:input.patientId ?? null,
    p_reason:input.reason ?? null,
    p_metadata:input.metadata ?? {},
    p_ip_address:request.ip,
    p_request_id:request.id,
    p_occurred_at:occurredAt,
  });
  if(error) throw error;
  return data;
}
