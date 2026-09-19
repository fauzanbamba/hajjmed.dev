function standardAppointment(p,service){
  return state.confirmedAppointments.find(a=>a.pilgrimId===p.id&&a.status==='Confirmed'&&(a.service===service||(service!=='review'&&a.service==='both')));
}
function nonClearedScreening(p){
  let status=String(state.screeningRecords[p.id]?.status||p.screen||p.status||'').toUpperCase();
  return !status.startsWith('GREEN')&&!status.includes('CLEARED')&&!status.includes('TRAVEL READY');
}
function hardAccessDenied(p,service,message){
  controlBreach(`${service} access`,p,message);
  let host=$('#tabBody');if(!host)return;
  host.innerHTML=`<div class="hard-access-gate">${icon('alert')}<div><small>ACCESS CONTROL ENFORCED</small><h3>${service==='review'?'Confirmed review appointment required':'Confirmed appointment required'}</h3><p>${message}</p><strong>${p.name} · ${p.passport}</strong></div><button class="btn primary" id="hardGateAppointments">Go to appointments</button></div>`;
  $('#hardGateAppointments').onclick=()=>{state.page='appointments';render()};
}
function screeningReviewAccessPanel(p){
  if(!state.screeningRecords[p.id]||!nonClearedScreening(p)||$('#screeningReviewAccess'))return;
  let appointment=standardAppointment(p,'review'),host=$('#tabBody');if(!host)return;
  host.insertAdjacentHTML('beforeend',`<section class="section-card review-access-panel" id="screeningReviewAccess"><div class="section-heading"><b>R</b><div><h3>Subsequent screening review</h3><p>The original screening remains the authoritative record. A review continues it and does not create a duplicate screening.</p></div><span class="badge ${appointment?'green':'amber'}">${appointment?'Appointment confirmed':'Booking required'}</span></div>${appointment?`<div class="review-booking-summary"><div><small>REFERENCE</small><strong>${appointment.id}</strong></div><div><small>DATE AND SESSION</small><strong>${appointment.date} · ${appointment.time}</strong></div><div><small>REGION</small><strong>${appointment.region}</strong></div></div><button class="btn primary" id="openAuthorisedReview">Open authorised review encounter</button>`:`<div class="record-lock">${icon('alert')}<div><strong>Review access denied</strong><span>No confirmed medical-review appointment exists. Book and confirm a review before the review interface can be opened.</span></div></div><button class="btn outline" id="bookRequiredReview">Go to appointments</button>`}</section>`);
  let open=$('#openAuthorisedReview');if(open)open.onclick=()=>openScreeningEncounter();
  let book=$('#bookRequiredReview');if(book)book.onclick=()=>{state.page='appointments';render()};
}
function enforceDirectClinicalTabAccess(){
  if(isLeader()||state.page!=='record'||!state.patient)return;
  let p=state.patient;
  if(state.tab==='screening'){
    let existing=state.screeningRecords[p.id];
    if(!existing&&!standardAppointment(p,'screening')){hardAccessDenied(p,'screening','Medical history, examination and screening entry cannot be opened without a confirmed screening appointment.');return}
    screeningReviewAccessPanel(p);
  }
  if(state.tab==='vaccines'){
    let existing=state.vaccinationEncounterRecords[p.id]||p.vax!=='Due';
    if(!existing&&!standardAppointment(p,'vaccination'))hardAccessDenied(p,'vaccination','Vaccination entry cannot be opened without a confirmed vaccination appointment.');
  }
}
function makeScreeningRemarksOptional(root=document){
  root.querySelectorAll('.history-remark').forEach(remark=>{remark.required=false;remark.removeAttribute('required');let select=remark.closest('.history-row')?.querySelector('.history-response');if(select&&!select.dataset.optionalRemark){let previous=select.onchange;select.onchange=e=>{previous?.call(select,e);remark.required=false;remark.removeAttribute('required')};select.dataset.optionalRemark='true'}});
  root.querySelectorAll('.history-remark').forEach(remark=>remark.required=false);
}
function attachFinalAppointmentGuard(modal,p,service){
  let form=modal?.querySelector('form');if(!form||isLeader()||form.dataset.finalAppointmentGuard)return;
  form.dataset.finalAppointmentGuard='true';
  form.addEventListener('submit',e=>{let requiredService=service;if(service==='screening'&&state.screeningRecords[p.id])requiredService='review';if(standardAppointment(p,requiredService))return;e.preventDefault();e.stopImmediatePropagation();showControlledBlock(`${requiredService==='review'?'Review':'Appointment'} access denied`,`${p.name} does not have a confirmed ${requiredService} appointment. The form cannot be submitted.`,p,`submit ${requiredService} without confirmed appointment`)},true);
}
const hardenedScreeningBase=openScreeningEncounter;
openScreeningEncounter=function(){let p=selectedPatient(),result=hardenedScreeningBase(),modal=$$('.modal').at(-1);makeScreeningRemarksOptional(modal||document);if(modal&&!modal.querySelector('.appointment-gate'))attachFinalAppointmentGuard(modal,p,'screening');return result};
const hardenedVaccinationBase=openVaccinationEncounter;
openVaccinationEncounter=function(){let p=selectedPatient(),result=hardenedVaccinationBase(),modal=$$('.modal').at(-1);if(modal&&!modal.querySelector('.appointment-gate'))attachFinalAppointmentGuard(modal,p,'vaccination');return result};
const hardenedControlRender=render;
render=function(){hardenedControlRender();makeScreeningRemarksOptional();enforceDirectClinicalTabAccess()};
