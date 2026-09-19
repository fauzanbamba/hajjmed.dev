state.nursingVitals=state.nursingVitals||{};

function nurseObservationFields(p=selectedPatient()){
  return `<div class="section-heading span2"><b>C1</b><div><h3>General examination and vital signs</h3><p>Nursing scope: initial observations only. System examinations and mobility assessment are completed by a doctor.</p></div></div>
  <label class="field"><span>General appearance *</span><select class="input" id="nurseAppearance" required><option value="">Select</option><option>Well appearing</option><option>Unwell appearing</option><option>Distressed</option></select></label>
  <label class="field"><span>Blood pressure *</span><input class="input" id="nurseBp" required placeholder="e.g. 120/80 mmHg"></label>
  <label class="field"><span>Pulse *</span><input class="input" id="nursePulse" type="number" min="20" max="250" required placeholder="beats/min"></label>
  <label class="field"><span>Respiratory rate *</span><input class="input" id="nurseRr" type="number" min="4" max="70" required placeholder="breaths/min"></label>
  <label class="field"><span>Temperature *</span><input class="input" id="nurseTemp" type="number" min="30" max="45" step="0.1" required placeholder="°C"></label>
  <label class="field"><span>SpO₂ *</span><input class="input" id="nurseSpo2" type="number" min="50" max="100" required placeholder="%"></label>
  <label class="field"><span>Weight *</span><input class="input" id="nurseWeight" type="number" min="20" max="250" step="0.1" required placeholder="kg"></label>
  <label class="field"><span>Height *</span><input class="input" id="nurseHeight" type="number" min="1" max="2.3" step="0.01" required placeholder="metres"></label>
  <label class="field"><span>Pallor *</span><select class="input" id="nursePallor" required><option>Absent</option><option>Present</option></select></label>
  <label class="field"><span>Jaundice *</span><select class="input" id="nurseJaundice" required><option>Absent</option><option>Present</option></select></label>
  <label class="field"><span>Cyanosis *</span><select class="input" id="nurseCyanosis" required><option>Absent</option><option>Present</option></select></label>
  <label class="field"><span>Peripheral oedema *</span><select class="input" id="nurseOedema" required><option>Absent</option><option>Present</option></select></label>
  ${frailtyAssessmentFields(p)}
  <div class="scope-lock span2"><strong>Doctor-only section</strong><span>Cardiovascular, respiratory, abdominal and CNS examinations; mobility assessment; investigation orders; screening classification; clearance and authentication are not available to nurses.</span></div>`;
}

function collectNurseAssessment(root,p){
  let responses=[...root.querySelectorAll('.history-response')].map(s=>({response:s.value,remark:s.closest('.history-row').querySelector('.history-remark').value}));
  state.nursingHistories[p.id]={responses,nextOfKin:root.querySelector('[aria-label="next-of-kin"]')?.value||'',recordedBy:state.user.name,recordedAt:new Date().toLocaleString(),status:'Completed'};
  let value=id=>root.querySelector(`#${id}`)?.value||'';
  state.nursingVitals[p.id]={appearance:value('nurseAppearance'),bp:value('nurseBp'),pulse:value('nursePulse'),rr:value('nurseRr'),temperature:value('nurseTemp'),spo2:value('nurseSpo2'),weight:value('nurseWeight'),height:value('nurseHeight'),pallor:value('nursePallor'),jaundice:value('nurseJaundice'),cyanosis:value('nurseCyanosis'),oedema:value('nurseOedema'),frailtyScore:value('screenFrailtyScore'),frailtyEvidence:value('screenFrailtyEvidence'),recordedBy:state.user.name,recordedAt:new Date().toLocaleString()};
}

function nursingScopedEncounter(){
  let modal=encounterShell('Nursing screening assessment','Medical history, general examination and vital signs only. Doctor-only screening sections are access controlled.',`<div class="form-grid">${encounterPatientField()}${facilityField('Screening facility')}<label class="field"><span>Appointment reference *</span><input class="input" required></label>${clinicalHistorySection()}${nurseObservationFields()}</div>`),form=modal.querySelector('form');
  let nok=[...modal.querySelectorAll('.field')].find(x=>x.textContent.includes('Next of kin'))?.querySelector('input');if(nok)nok.setAttribute('aria-label','next-of-kin');
  form.onsubmit=e=>{e.preventDefault();let p=selectedPatient();collectNurseAssessment(modal,p);toast('Nursing history and initial observations saved — visible to the doctor and authorised leaders');setTimeout(()=>modal.remove(),700)};
  return modal;
}

function nurseScreeningRecord(p){
  let saved=state.nursingVitals[p.id];return `<div class="nurse-scope-banner"><strong>Nursing screening scope</strong><span>You may record medical history, general examination and vital signs. System examinations, mobility, orders and clearance are doctor-only.</span></div><form id="nurseRecordAssessment" class="checklist-form"><div class="section-card"><div class="form-grid">${clinicalHistorySection()}${nurseObservationFields(p)}</div><div class="form-actions"><span>${saved?`Last nursing observations: ${saved.recordedAt} by ${saved.recordedBy}`:'No nursing assessment saved yet.'}</span><button class="btn primary">Save nursing assessment</button></div></div></form>`;
}

const nurseScopeTabBody=tabBody;
tabBody=function(p,limited){if(state.role==='nurse'&&state.tab==='screening')return nurseScreeningRecord(p);return nurseScopeTabBody(p,limited)};

const nurseScopeRender=render;
render=function(){nurseScopeRender();if(state.role!=='nurse'||state.page!=='record')return;document.querySelectorAll('[data-tab="care"],[data-tab="privacy"]').forEach(x=>x.remove());let screening=document.querySelector('[data-tab="screening"]');if(screening)screening.textContent='History & vital signs';let form=$('#nurseRecordAssessment');if(form)form.onsubmit=e=>{e.preventDefault();collectNurseAssessment(form,state.patient);toast('Nursing assessment saved — visible to the doctor and authorised leaders');render()}};

const nurseScopeScreeningBase=openScreeningEncounter;
openScreeningEncounter=function(){if(state.role==='nurse')return requireConfirmedAppointment('screening',nursingScopedEncounter);return nurseScopeScreeningBase()};

const nurseScopeHistoryBase=nursingHistoryEncounter;
nursingHistoryEncounter=function(){if(state.role==='nurse')return requireConfirmedAppointment('screening',nursingScopedEncounter);return nurseScopeHistoryBase()};

function setDoctorScreeningValue(modal,label,value){let input=findScreeningField(modal,label)?.querySelector('input,select,textarea');if(input&&value!==undefined&&value!==''){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}))}}
function synchroniseNursingAssessmentToDoctor(modal){
  let p=selectedPatient(),history=state.nursingHistories[p.id],vitals=state.nursingVitals[p.id];
  if(!history&&!vitals)return;
  if(history)modal.querySelectorAll('.history-response').forEach((select,i)=>{let saved=history.responses[i];if(!saved)return;select.value=saved.response||'No';let remark=select.closest('.history-row')?.querySelector('.history-remark');if(remark)remark.value=saved.remark||'';select.closest('.history-row')?.classList.toggle('positive-history',select.value!=='No')});
  if(vitals){setDoctorScreeningValue(modal,'Blood pressure *',vitals.bp);setDoctorScreeningValue(modal,'Pulse *',vitals.pulse);setDoctorScreeningValue(modal,'Respiratory rate *',vitals.rr);setDoctorScreeningValue(modal,'SpO₂ *',vitals.spo2);let direct={screenTemp:vitals.temperature,screenWeight:vitals.weight,screenHeight:vitals.height,screenFrailtyScore:vitals.frailtyScore,screenFrailtyEvidence:vitals.frailtyEvidence};Object.entries(direct).forEach(([id,value])=>{let input=modal.querySelector(`#${id}`);if(input&&value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}))}})}
  let anchor=[...modal.querySelectorAll('.section-heading')].find(x=>x.textContent.includes('Clinical history'))||modal.querySelector('.form-grid');anchor?.insertAdjacentHTML('beforebegin',`<div class="nursing-sync span2"><strong>Nursing assessment synchronised</strong><span>${vitals?.recordedBy||history?.recordedBy||'Nurse'} · ${vitals?.recordedAt||history?.recordedAt||'Recorded previously'}</span><small>History and initial observations are prefilled for review. The doctor must verify them and complete the doctor-only examination, mobility assessment and clearance decision.</small></div>`);
  assessScreening(modal);
}

const nursingDoctorSyncBase=openScreeningEncounter;
openScreeningEncounter=function(){let result=nursingDoctorSyncBase();if(!['clinician','admin','medicaldirector'].includes(state.role))return result;let modal=$$('.modal').at(-1);if(!modal?.querySelector('#screeningOutcome'))return result;synchroniseNursingAssessmentToDoctor(modal);let pilgrim=modal.querySelector('#encounterPilgrim');if(pilgrim){let oldChange=pilgrim.onchange;pilgrim.onchange=()=>{oldChange?.();synchroniseNursingAssessmentToDoctor(modal)}}return result};

const leadershipSettingsShell=shell;
shell=function(){let html=leadershipSettingsShell();if(['admin','medicaldirector'].includes(state.role))return html;return html.replace(`<div class="nav-label">System</div><button class="nav" data-page="settings">${icon('settings')}Settings & audit</button>`,'')};
const leadershipSettingsRender=render;
render=function(){if(state.user&&state.page==='settings'&&!['admin','medicaldirector'].includes(state.role))state.page=state.role==='pilgrim'?'myhealth':state.role==='agent'?'pilgrims':'appointments';return leadershipSettingsRender()};
