import type { Role } from '../lib/db-types.js';

export const CLINICAL_ENTRY_EDIT_WINDOW_MS=24*60*60*1000;

export function mayEditClinicalEntry(createdAt:Date,role:Role,now=new Date()){
  if(role==='ADMIN'||role==='MEDICAL_DIRECTOR')return true;
  return now.getTime()-createdAt.getTime()<CLINICAL_ENTRY_EDIT_WINDOW_MS;
}

export function assertClinicalEntryEditable(createdAt:Date,role:Role,now=new Date()){
  if(mayEditClinicalEntry(createdAt,role,now))return;
  throw Object.assign(new Error('Clinical entry is read-only after 24 hours'),{statusCode:423,code:'ENTRY_LOCKED'});
}
