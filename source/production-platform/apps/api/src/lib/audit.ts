import type { FastifyRequest } from 'fastify';
import { prisma } from './prisma.js';
import { sha256 } from './crypto.js';
import type { AuditAction, Role, Prisma } from '@prisma/client';

export async function audit(request:FastifyRequest,input:{action:AuditAction;subjectType:string;subjectId?:string;patientId?:string;reason?:string;metadata?:Record<string,unknown>}){
  const actor=request.user as undefined|{sub:string;role:Role};
  return prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('hajjmed_audit_chain'))`;
    const previous=await tx.auditEvent.findFirst({orderBy:[{occurredAt:'desc'},{id:'desc'}],select:{eventHash:true}}),occurredAt=new Date(),payload={...input,actorUserId:actor?.sub,actorRole:actor?.role,requestId:request.id,occurredAt:occurredAt.toISOString(),previousHash:previous?.eventHash??null},eventHash=sha256(JSON.stringify(payload));
    return tx.auditEvent.create({data:{action:input.action,actorUserId:actor?.sub,actorRole:actor?.role,subjectType:input.subjectType,subjectId:input.subjectId,patientId:input.patientId,reason:input.reason,metadata:(input.metadata??{}) as Prisma.InputJsonValue,ipAddress:request.ip,requestId:request.id,occurredAt,previousHash:previous?.eventHash,eventHash}});
  });
}
