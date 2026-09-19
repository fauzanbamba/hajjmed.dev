import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Role } from '@prisma/client';
import { prisma } from './prisma.js';
const rank:Record<Role,number>={PILGRIM:1,AGENT:1,CLINICIAN:2,NURSE:2,ALLIED_HEALTH:2,PHARMACIST:2,ADMIN:3,MEDICAL_DIRECTOR:4};
export const requireRoles=(...roles:Role[])=>async(request:FastifyRequest,reply:FastifyReply)=>{await request.jwtVerify();const session=await prisma.session.findUnique({where:{id:request.user.sessionId},include:{user:{select:{status:true,role:true}}}});if(!session||session.revokedAt||session.expiresAt<=new Date()||session.user.status!=='ACTIVE'||session.user.role!==request.user.role)return reply.code(401).send({error:{code:'SESSION_REVOKED',message:'Session is no longer active',requestId:request.id}});if(!roles.includes(request.user.role))return reply.code(403).send({error:{code:'FORBIDDEN',message:'Insufficient authority',requestId:request.id}})};
export const canOverride=(actor:Role,target:Role)=>['ADMIN','MEDICAL_DIRECTOR'].includes(actor)&&rank[actor]>rank[target];
export async function assertPilgrimAccess(request:FastifyRequest,pilgrim:{id:string;organizationId:string|null}){
  const u=request.user;if(u.role==='MEDICAL_DIRECTOR'||u.role==='ADMIN'||u.role==='CLINICIAN')return;
  if(u.role==='PILGRIM'&&u.pilgrimId===pilgrim.id)return;
  if(u.role==='AGENT'&&u.organizationId&&u.organizationId===pilgrim.organizationId)return;
  const e=Object.assign(new Error('Patient record not found'),{statusCode:404,code:'NOT_FOUND'});throw e;
}
