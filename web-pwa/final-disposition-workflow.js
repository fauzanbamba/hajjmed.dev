function correctFinalDispositionWorkflow(modal){
  const form=modal?.querySelector('form');
  const select=modal?.querySelector('#structuredDisposition');
  const section=modal?.querySelector('#advancedDispositionFields');
  if(!form||!select||!section||section.dataset.corrected)return;
  section.dataset.corrected='true';
  form.insertBefore(section,form.querySelector('.modal-actions'));
  const admission=section.querySelector('.admission-fields');
  const death=section.querySelector('.death-fields');
  const hospital=section.querySelector('#admissionHospital');
  const ward=section.querySelector('#admissionWard');
  const treatment=section.querySelector('#admissionTreatment');
  const daily=section.querySelector('#admissionDailyUpdate');
  const summaryUpload=section.querySelector('#admissionDocument');
  const referralPath=document.createElement('section');
  referralPath.className='disposition-pathway referral-transfer-pathway';
  referralPath.innerHTML='<header><span>REFERRAL / TRANSFER PATHWAY</span><h3>Receiving-facility follow-up</h3><p>Complete only when the pilgrim is referred or transferred.</p></header>';
  admission.before(referralPath);
  referralPath.appendChild(admission);
  const deceasedPath=document.createElement('section');
  deceasedPath.className='disposition-pathway deceased-patient-pathway';
  deceasedPath.innerHTML='<header><span>DECEASED-PATIENT PATHWAY</span><h3>Death documentation</h3><p>Complete only when the recorded disposition is deceased.</p></header>';
  death.before(deceasedPath);
  deceasedPath.appendChild(death);
  hospital.closest('.field').querySelector('span').textContent='Place of referral or transfer *';
  ward.closest('.field').querySelector('span').textContent='Ward admitted to *';
  treatment.closest('.field').querySelector('span').textContent='Condition being treated for *';
  daily.closest('.field').querySelector('span').textContent='Daily clinical summary / update *';
  summaryUpload.closest('.field').querySelector('span').textContent='Discharge summary upload';
  death.insertAdjacentHTML('afterbegin','<label class="field"><span>Place of death *</span><input class="input" id="placeOfDeath" maxlength="200"></label><label class="field"><span>Time of death *</span><input class="input" id="timeOfDeath" type="datetime-local"></label>');
  death.querySelector('#deathSummary').closest('.field').querySelector('span').textContent='Clinical summary *';
  death.querySelector('#deathAdmissionSummary').closest('.field').querySelector('span').textContent='Admission or discharge summary';
  const oldReferral=modal.querySelector('#referralPlaceField');
  if(oldReferral){oldReferral.hidden=true;oldReferral.querySelector('input').required=false}
  const update=()=>{
    const referred=['Referred','Transferred / evacuated'].includes(select.value);
    const deceased=select.value==='Deceased';
    section.hidden=!referred&&!deceased;
    referralPath.hidden=!referred;
    deceasedPath.hidden=!deceased;
    admission.hidden=false;
    death.hidden=false;
    [hospital,ward,treatment,daily].forEach(element=>element.required=referred);
    section.querySelector('#placeOfDeath').required=deceased;
    section.querySelector('#timeOfDeath').required=deceased;
    section.querySelector('#deathSummary').required=deceased;
    const legacy=modal.querySelector('#referralPlace');
    if(legacy){legacy.required=false;legacy.value=referred?hospital.value:''}
  };
  hospital.addEventListener('input',()=>{const legacy=modal.querySelector('#referralPlace');if(legacy)legacy.value=hospital.value});
  select.addEventListener('change',update);
  update();
  form.addEventListener('submit',()=>{
    const pilgrim=selectedPatient();
    const referred=['Referred','Transferred / evacuated'].includes(select.value);
    if(referred){
      pilgrim.referralPlace=hospital.value;
      pilgrim.admissionWard=ward.value;
      pilgrim.treatmentFor=treatment.value;
      pilgrim.dailyUpdate=daily.value;
      pilgrim.dailyUpdateDueAt=new Date(Date.now()+86400000).toISOString();
    }
    if(select.value==='Deceased'){
      pilgrim.placeOfDeath=section.querySelector('#placeOfDeath').value;
      pilgrim.timeOfDeath=section.querySelector('#timeOfDeath').value;
      pilgrim.deathSummary=section.querySelector('#deathSummary').value;
    }
  },true);
}

const correctedDispositionEncounter=openClinicEncounter;
openClinicEncounter=function(acute=false){
  const result=correctedDispositionEncounter(acute);
  correctFinalDispositionWorkflow($$('.modal').at(-1));
  return result;
};
