import type { Role } from '@prisma/client';

type CommunicationActor={sub?:string;role:Role;organizationId?:string;pilgrimId?:string};
type CommunicationScope={pilgrimId:string;organizationId:string|null;openedByUserId?:string;directRecipientUserId?:string|null};

export function canAccessCommunication(actor:CommunicationActor,thread:CommunicationScope){
  if(thread.directRecipientUserId)return ['ADMIN','MEDICAL_DIRECTOR'].includes(actor.role)||actor.sub===thread.openedByUserId||actor.sub===thread.directRecipientUserId;
  if(['ADMIN','MEDICAL_DIRECTOR','CLINICIAN','NURSE'].includes(actor.role))return true;
  if(actor.role==='PILGRIM')return Boolean(actor.pilgrimId&&actor.pilgrimId===thread.pilgrimId);
  if(actor.role==='AGENT')return Boolean(actor.organizationId&&actor.organizationId===thread.organizationId);
  return false;
}
