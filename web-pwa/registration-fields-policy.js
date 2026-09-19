const registrationWithoutPassportDatesBase=openPassportRegistration;
function setPilgrimEmailOptional(){
  const email=$('#passportForm input[type="email"]');
  if(!email)return;
  email.required=false;
  email.placeholder='Optional';
  const label=email.closest('.field')?.querySelector('span');
  if(label)label.textContent='Email address (optional)';
}
openPassportRegistration=function(){
  const result=registrationWithoutPassportDatesBase();
  const form=$('#passportForm');
  if(!form)return result;
  $$('label.field',form).filter(label=>['Date of issue *','Date of expiry *'].includes(label.querySelector('span')?.textContent.trim())).forEach(label=>label.remove());
  form.insertAdjacentHTML('beforeend','<input type="hidden" id="regExpiry" value="">');
  const heading=form.querySelector('.section-heading p');
  if(heading)heading.textContent='Enter the required identity details exactly as printed in the passport';
  setPilgrimEmailOptional();
  return result;
};

const optionalEmailEnhancementBase=enhanceRegistrationForm;
enhanceRegistrationForm=function(){
  const result=optionalEmailEnhancementBase();
  setPilgrimEmailOptional();
  return result;
};

const screeningWithoutPassportExpiryBase=screeningChecklist;
screeningChecklist=function(p){
  const markup=screeningWithoutPassportExpiryBase(p);
  return markup.replace(/<label class="field"><span>Passport expiry<\/span><input class="input" type="date"[^>]*><\/label>/,'');
};

updatePassportStatus=function(){
  const p=bookingPilgrim(),service=$('#apptService')?.value,el=$('#bookingPassport');
  if(!p||!el)return;
  const required=['screening','both','review'].includes(service),valid=Boolean(p.passport);
  el.className=`passport-status ${valid?'verified':'missing'}`;
  el.innerHTML=valid?`${icon('screen')}<span><strong>Passport verified · ${p.passport}</strong><small>${p.surname}, ${p.given} · Passport biodata recorded</small></span>`:`${icon('alert')}<span><strong>${required?'Medical booking blocked':'Passport not recorded'}</strong><small>Add a passport number and required biodata before medical screening or review can be booked.</small></span>`;
};

const passportNumberOnlyAppointmentBase=confirmAppointment;
confirmAppointment=function(event){
  const pilgrim=bookingPilgrim();
  if(!pilgrim?.passport){event.preventDefault();toast('Medical booking blocked — passport number and biodata are required');return}
  const originalExpiry=pilgrim.expiry;
  pilgrim.expiry='9999-12-31';
  try{return passportNumberOnlyAppointmentBase(event)}finally{pilgrim.expiry=originalExpiry}
};
