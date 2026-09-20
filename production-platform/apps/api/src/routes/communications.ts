import type { FastifyInstance, FastifyRequest } from 'fastify';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { db } from '../lib/db.js';
import { requireRoles } from '../lib/authz.js';
import { audit } from '../lib/audit.js';
import { canAccessCommunication } from '../services/communication-policy.js';
import { queueCommunicationActionNotifications,queuePilgrimPortalUpdateNotifications } from '../services/notifications.js';

const allowedRoles=['PILGRIM','AGENT','CLINICIAN','NURSE','PHARMACIST','ADMIN','MEDICAL_DIRECTOR'] as const;
const idSchema=z.object({id:z.string().uuid()});
const createSchema=z.object({
  pilgrimId:z.string().uuid(),
  category:z.enum(['CLINICAL_CONCERN','SCREENING','VACCINATION','APPOINTMENT','MEDICATION','ACCESSIBILITY','OTHER']),
  subject:z.string().trim().min(5).max(160),
  priority:z.enum(['ROUTINE','URGENT']).default('ROUTINE'),
  message:z.string().trim().min(2).max(2000)
  ,recipientUserId:z.string().uuid().optional(),
  recipientGroup:z.enum(['AGENT','MEDICAL_TEAM']).optional()
});
const messageSchema=z.object({message:z.string().trim().min(1).max(2000)});
const updateSchema=z.object({status:z.enum(['OPEN','IN_REVIEW','RESOLVED','CLOSED']).optional(),assignedToUserId:z.string().uuid().nullable().optional()}).refine(v=>Object.keys(v).length>0);

type ThreadScope={id:string;pilgrimId:string;organizationId:string|null;openedByUserId:string;assignedToUserId:string|null;directRecipientUserId:string|null};

function forbidden(){return Object.assign(new Error('Conversation not found'),{statusCode:404,code:'NOT_FOUND'});}
function pilgrimOutcome(status:string){return status==='RESOLVED'||status==='CLOSED'?'RESOLVED':status==='IN_REVIEW'?'REVIEW':'OPEN';}
function pilgrimEnquirySummary(thread:{id:string;reference:string;subject:string;category:string;status:string;recipientGroup:string|null;createdAt:Date;updatedAt:Date}){return {id:thread.id,reference:thread.reference,subject:thread.subject,category:thread.category,recipientGroup:thread.recipientGroup,outcome:pilgrimOutcome(thread.status),createdAt:thread.createdAt,updatedAt:thread.updatedAt};}

function assertThreadAccess(request:FastifyRequest,thread:ThreadScope){
  if(canAccessCommunication(request.user,thread))return;
  throw forbidden();
}

async function threadForRequest(request:FastifyRequest,id:string){
  const thread=await db.communicationThread.findUnique({where:{id}});
  if(!thread)throw forbidden();
  assertThreadAccess(request,thread);
  return thread;
}

export async function communicationRoutes(app:FastifyInstance){
  app.get('/',{preHandler:requireRoles(...allowedRoles)},async request=>{
    const user=request.user;
    const where=['ADMIN','MEDICAL_DIRECTOR'].includes(user.role)?{}:{OR:[{openedByUserId:user.sub},{directRecipientUserId:user.sub},{directRecipientUserId:null,...(user.role==='AGENT'?{organizationId:user.organizationId??'NONE'}:user.role==='PILGRIM'?{pilgrimId:user.pilgrimId??'NONE'}:{})}]};
    const threads=await db.communicationThread.findMany({where,include:{pilgrim:{select:{id:true,givenNames:true,surname:true,passportNumberNormalized:true,photoObjectKey:true}},openedBy:{select:{id:true,displayName:true,role:true}},assignedTo:{select:{id:true,displayName:true,role:true}},messages:{orderBy:{createdAt:'desc'},take:1,select:{body:true,createdAt:true}}},orderBy:{updatedAt:'desc'},take:100});
    return user.role==='PILGRIM'?threads.map(pilgrimEnquirySummary):threads;
  });

  app.post('/',{preHandler:requireRoles(...allowedRoles)},async(request,reply)=>{
    const body=createSchema.parse(request.body);
    const pilgrim=await db.pilgrim.findUnique({where:{id:body.pilgrimId},select:{id:true,organizationId:true}});
    if(!pilgrim)throw forbidden();
    if(request.user.role==='AGENT'&&(!request.user.organizationId||request.user.organizationId!==pilgrim.organizationId))throw forbidden();
    if(request.user.role==='PILGRIM'&&request.user.pilgrimId!==pilgrim.id)throw forbidden();
    if(request.user.role==='PILGRIM'){
      if(body.recipientUserId)return reply.code(403).send({error:{code:'PILGRIM_DIRECT_RECIPIENT_FORBIDDEN',message:'Pilgrims may send enquiries only to their accredited agent or the medical team'}});
      if(!body.recipientGroup)return reply.code(422).send({error:{code:'RECIPIENT_GROUP_REQUIRED',message:'Select the accredited agent or medical team'}});
      if(body.recipientGroup==='AGENT'&&!pilgrim.organizationId)return reply.code(422).send({error:{code:'AGENT_NOT_AVAILABLE',message:'This pilgrim does not have an accredited agent'}});
    }
    if(body.recipientUserId){if(body.recipientUserId===request.user.sub)return reply.code(422).send({error:{code:'INVALID_RECIPIENT',message:'A user cannot address a direct thread to themselves'}});const recipient=await db.user.findFirst({where:{id:body.recipientUserId,status:'ACTIVE'},select:{id:true}});if(!recipient)return reply.code(422).send({error:{code:'INVALID_RECIPIENT',message:'The selected recipient is not active'}})}
    const reference=`COM-${new Date().getUTCFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const created=await db.$transaction(async tx=>tx.communicationThread.create({data:{reference,pilgrimId:pilgrim.id,organizationId:pilgrim.organizationId,openedByUserId:request.user.sub,directRecipientUserId:body.recipientUserId,recipientGroup:request.user.role==='PILGRIM'?body.recipientGroup:null,category:body.category,subject:body.subject,priority:body.priority,messages:{create:{authorUserId:request.user.sub,body:body.message}}},include:{messages:true}}));
    if(request.user.role!=='PILGRIM')await queuePilgrimPortalUpdateNotifications({pilgrimId:pilgrim.id,updateType:'New message or complaint'});
    await queueCommunicationActionNotifications({threadId:created.id,actorUserId:request.user.sub,event:'OPENED'});
    await audit(request,{action:'CREATE',subjectType:'CommunicationThread',subjectId:created.id,patientId:pilgrim.id,metadata:{reference,category:body.category,priority:body.priority}});
    return reply.code(201).send(request.user.role==='PILGRIM'?pilgrimEnquirySummary(created):created);
  });

  app.get('/:id',{preHandler:requireRoles(...allowedRoles)},async request=>{
    const {id}=idSchema.parse(request.params);await threadForRequest(request,id);
    const thread=await db.communicationThread.findUniqueOrThrow({where:{id},include:{pilgrim:{select:{id:true,givenNames:true,surname:true,passportNumberNormalized:true,photoObjectKey:true}},openedBy:{select:{id:true,displayName:true,role:true}},assignedTo:{select:{id:true,displayName:true,role:true}},messages:{include:{author:{select:{id:true,displayName:true,role:true}}},orderBy:{createdAt:'asc'}}}});
    await audit(request,{action:'READ',subjectType:'CommunicationThread',subjectId:id,patientId:thread.pilgrimId});return request.user.role==='PILGRIM'?pilgrimEnquirySummary(thread):thread;
  });

  app.post('/:id/messages',{preHandler:requireRoles(...allowedRoles)},async(request,reply)=>{
    const {id}=idSchema.parse(request.params),body=messageSchema.parse(request.body),thread=await threadForRequest(request,id);
    if(threadStatusClosed(await db.communicationThread.findUniqueOrThrow({where:{id},select:{status:true}}).then(v=>v.status)))return reply.code(409).send({error:{code:'THREAD_CLOSED',message:'Closed conversations cannot receive messages',requestId:request.id}});
    const message=await db.$transaction(async tx=>{const created=await tx.communicationMessage.create({data:{threadId:id,authorUserId:request.user.sub,body:body.message}});await tx.communicationThread.update({where:{id},data:{updatedAt:new Date()}});return created});
    if(request.user.role!=='PILGRIM')await queuePilgrimPortalUpdateNotifications({pilgrimId:thread.pilgrimId,updateType:'New secure message'});
    await queueCommunicationActionNotifications({threadId:id,actorUserId:request.user.sub,event:'MESSAGE'});
    await audit(request,{action:'CREATE',subjectType:'CommunicationMessage',subjectId:message.id,patientId:thread.pilgrimId,metadata:{threadId:id}});return reply.code(201).send(message);
  });

  app.patch('/:id',{preHandler:requireRoles(...allowedRoles)},async request=>{
    const {id}=idSchema.parse(request.params),body=updateSchema.parse(request.body),thread=await threadForRequest(request,id);
    const clinicalRole=['CLINICIAN','NURSE','ADMIN','MEDICAL_DIRECTOR'].includes(request.user.role);
    if(body.assignedToUserId!==undefined&&!['ADMIN','MEDICAL_DIRECTOR'].includes(request.user.role))throw Object.assign(new Error('Only programme leadership can assign conversations'),{statusCode:403,code:'FORBIDDEN'});
    if(body.status&&!clinicalRole&&!(request.user.role==='AGENT'&&body.status==='CLOSED'))throw Object.assign(new Error('Status transition is not permitted'),{statusCode:403,code:'FORBIDDEN'});
    if(body.assignedToUserId){const assignee=await db.user.findFirst({where:{id:body.assignedToUserId,role:{in:['CLINICIAN','NURSE']},status:'ACTIVE'},select:{id:true}});if(!assignee)throw Object.assign(new Error('Active clinician not found'),{statusCode:422,code:'INVALID_ASSIGNEE'});}
    const updated=await db.communicationThread.update({where:{id},data:{...body,resolvedAt:body.status==='RESOLVED'?new Date():body.status?null:undefined}});
    const metadata=Object.fromEntries(Object.entries({status:body.status,assignedToUserId:body.assignedToUserId}).filter(([,value])=>value!==undefined));
    await queueCommunicationActionNotifications({threadId:id,actorUserId:request.user.sub,event:body.assignedToUserId!==undefined?'ASSIGNED':body.status==='RESOLVED'?'RESOLVED':'MESSAGE'});await audit(request,{action:'UPDATE',subjectType:'CommunicationThread',subjectId:id,patientId:thread.pilgrimId,metadata});return updated;
  });
}

function threadStatusClosed(status:string){return status==='CLOSED';}
