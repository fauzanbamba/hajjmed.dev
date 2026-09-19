import { EventEmitter } from 'node:events';

export type ClinicalChangeEvent={type:string;actorUserId:string;actorRole:string;occurredAt:string;requestId:string};
const clinicalEvents=new EventEmitter();
clinicalEvents.setMaxListeners(500);

export function publishClinicalChange(event:ClinicalChangeEvent){clinicalEvents.emit('change',event)}
export function subscribeClinicalChanges(listener:(event:ClinicalChangeEvent)=>void){clinicalEvents.on('change',listener);return()=>clinicalEvents.off('change',listener)}
