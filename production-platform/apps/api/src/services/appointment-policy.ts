import { regionalCapacity, type GhanaRegion } from '@hajjmed/contracts';

export const appointmentSessionHours=[8,10,12,14] as const;
export const appointmentLeadTimeMs=24*60*60*1000;

export function sessionIndex(date:Date){
  if(date.getUTCMinutes()!==0||date.getUTCSeconds()!==0||date.getUTCMilliseconds()!==0)return -1;
  return appointmentSessionHours.indexOf(date.getUTCHours() as typeof appointmentSessionHours[number]);
}

export function assertAppointmentTime(date:Date,now=new Date()){
  if(date.getTime()-now.getTime()<appointmentLeadTimeMs)throw Object.assign(new Error('Appointments must be made at least 24 hours in advance'),{statusCode:422,code:'APPOINTMENT_NOTICE_REQUIRED'});
  assertAppointmentSession(date);
}

export function assertAppointmentSession(date:Date){
  if(sessionIndex(date)<0)throw Object.assign(new Error('Choose a two-hour session beginning at 08:00, 10:00, 12:00 or 14:00'),{statusCode:422,code:'INVALID_SESSION'});
}

export function assertProtectedAppointmentTime(date:Date,now=new Date()){
  assertAppointmentSession(date);
  if(date.getTime()+2*60*60*1000<=now.getTime())throw Object.assign(new Error('A protected appointment cannot be booked after its two-hour session has ended'),{statusCode:422,code:'APPOINTMENT_SESSION_ENDED'});
}

export function standardSessionCapacity(region:GhanaRegion,index:number){
  const daily=regionalCapacity(region),base=Math.floor(daily/4),remainder=daily%4;
  return base+(index<remainder?1:0);
}

export function protectedSessionCapacity(index:number){
  const daily=10,base=Math.floor(daily/appointmentSessionHours.length),remainder=daily%appointmentSessionHours.length;
  return base+(index<remainder?1:0);
}

export function mayUseProtectedSlots(role:string){return role==='ADMIN'||role==='MEDICAL_DIRECTOR'}
export function mayCreateFollowUp(role:string){return ['CLINICIAN','ADMIN','MEDICAL_DIRECTOR'].includes(role)}
