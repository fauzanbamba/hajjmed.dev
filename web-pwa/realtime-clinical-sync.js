const clinicalRealtimeRoles=['clinician','nurse','allied','admin','medicaldirector'];
const clinicalSyncKeys=['nursingHistories','nursingVitals','screeningRecords','investigationOrders','investigationResults','prescriptions','stockMovements','inventory','dispositionRecords','clinicalDocuments','recordUpdatedAt'];
const clinicalChannel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('hajjmed-clinical-documentation-v1'):null;
let applyingClinicalSync=false;
function clinicalSnapshot(){return Object.fromEntries(clinicalSyncKeys.map(key=>[key,state[key]]))}
function publishClinicalDocumentation(eventType='CLINICAL_DOCUMENTATION_UPDATED'){
  if(applyingClinicalSync||!clinicalRealtimeRoles.includes(state.role))return;
  clinicalChannel?.postMessage({eventType,source:state.user?.name||state.role,at:new Date().toISOString(),data:clinicalSnapshot()});
}
if(clinicalChannel)clinicalChannel.onmessage=event=>{
  if(!clinicalRealtimeRoles.includes(state.role)||!event.data?.data)return;
  applyingClinicalSync=true;
  for(const [key,value] of Object.entries(event.data.data))state[key]=value;
  applyingClinicalSync=false;
  if(document.querySelector('.modal'))toast(`Clinical documentation updated by ${event.data.source} · current form retained`);
  else render();
};
function ensureEncounterDispensing(modal){
  const form=modal?.querySelector('form');
  if(!form||!['clinician','nurse'].includes(state.role))return;
  const actualRole=state.role;
  state.role='clinician';
  modal.querySelectorAll('.prescription-row').forEach(enhancePrescriptionForEncounterDispensing);
  state.role=actualRole;
  if(form.dataset.realtimeDispensingWired)return;
  form.dataset.realtimeDispensingWired='true';
  const list=modal.querySelector('.prescription-list');
  if(list)new MutationObserver(()=>{const role=state.role;state.role='clinician';list.querySelectorAll('.prescription-row').forEach(enhancePrescriptionForEncounterDispensing);state.role=role}).observe(list,{childList:true});
}
const realtimeClinicEncounter=openClinicEncounter;
openClinicEncounter=function(acute=false){const result=realtimeClinicEncounter(acute);ensureEncounterDispensing($$('.modal').at(-1));return result};
document.addEventListener('submit',event=>{
  if(!clinicalRealtimeRoles.includes(state.role))return;
  setTimeout(()=>{if(!event.defaultPrevented)publishClinicalDocumentation(event.target.id||'CLINICAL_FORM_SAVED')},0);
},true);
function showRealtimeStatus(){
  if(!clinicalRealtimeRoles.includes(state.role)||$('#clinicalRealtimeStatus'))return;
  const target=document.querySelector('.topbar')||document.querySelector('.hero');
  target?.insertAdjacentHTML('beforeend','<span class="clinical-realtime-status" id="clinicalRealtimeStatus"><i></i> Clinical documentation live</span>');
}
const realtimeClinicalRender=render;
render=function(){realtimeClinicalRender();showRealtimeStatus()};
showRealtimeStatus();
