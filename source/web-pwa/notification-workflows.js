state.notifications=state.notifications||[];
patients.forEach((p,i)=>{if(!p.email)p.email=`pilgrim${i+1}@example.com`});

function notificationPreview(title,recipient,subject,message){
  let phone=recipient.phone||'Registered mobile number',email=recipient.email||'Registered email address';
  state.notifications.unshift({title,recipient:recipient.name,phone,email,subject,message,createdAt:new Date().toISOString()});
  let modal=document.createElement('div');modal.className='modal';modal.innerHTML=`<div class="modal-card notification-receipt"><div class="modal-head"><div><span class="eyebrow" style="color:var(--green2)">Communication queued</span><h2>${title}</h2><p class="sub">The same update will be delivered to the contact details recorded at registration.</p></div><button class="iconbtn closeNotification">×</button></div><div class="delivery-grid"><article class="sms-copy"><small>TEXT MESSAGE · ${phone}</small><p>${message}</p></article><article class="sms-copy"><small>EMAIL · ${email}</small><strong>${subject}</strong><p>${message}</p></article></div><div class="modal-actions"><span>Delivery attempts and provider responses are retained in the audit trail.</span><button class="btn primary closeNotification">Done</button></div></div>`;document.body.appendChild(modal);modal.querySelectorAll('.closeNotification').forEach(b=>b.onclick=()=>{modal.remove();render()})
}

function appointmentMessage(event,d){
  let action=event==='CONFIRMED'?'confirmed':event==='AMENDED'?'amended':'cancelled',message=`HajjMed Ghana: ${d.p.name}, your appointment has been ${action}. Booking reference: ${d.ref}. ${d.purpose} at ${d.venue} on ${d.date}, ${d.time}.`;
  if(event!=='CANCELLED')message+=' Blood and urine samples may be taken. Imaging investigations may also be conducted if clinically indicated. Please bring your passport.';
  return message;
}

showBookingSmsReceipt=function(d){notificationPreview('Appointment confirmed',d.p,'HajjMed appointment confirmation',appointmentMessage('CONFIRMED',d))};

const notificationRegistrationBase=enhanceRegistrationForm;
enhanceRegistrationForm=function(){
  notificationRegistrationBase();let form=$('#passportForm'),email=form?.querySelector('input[type="email"]');if(!form||!email)return;
  email.required=true;email.placeholder='Required for appointment and health updates';email.closest('.field').querySelector('span').textContent='Email address *';email.id='regEmail';
  let original=form.onsubmit;form.onsubmit=e=>{let before=patients.length,address=email.value.trim().toLowerCase();original(e);if(patients.length>before){let p=patients.at(-1);p.email=address;registeredContacts.emails.add(address);setTimeout(()=>notificationPreview('Registration successful',p,'Welcome to HajjMed Ghana',`HajjMed Ghana: Registration successful for ${p.name}. Passport ${p.passport}. Your pilgrim portal account is now active. Keep your login details private.`),720)}};
};

const notificationScreeningBase=openScreeningEncounter;
openScreeningEncounter=function(){
  let result=notificationScreeningBase(),modal=$$('.modal').at(-1),outcome=modal?.querySelector('#screeningOutcome'),form=modal?.querySelector('form');
  if(!outcome||!form)return result;
  form.addEventListener('submit',()=>{let p=selectedPatient(),level=outcome.value.startsWith('GREEN')?'GREEN':outcome.value.startsWith('AMBER')?'AMBER':'RED',qualified=level==='GREEN',message=qualified?`HajjMed Ghana: ${p.name}, your screening outcome is GREEN. You are medically qualified for Hajj travel, subject to completion of required vaccination and documentation. Log in to view your recommendations.`:`HajjMed Ghana: ${p.name}, your screening requires further medical review (${level}). This is not a final travel clearance. Please log in to view the recommendations and await a review appointment.`;setTimeout(()=>notificationPreview(qualified?'Green — medically qualified':'Further review required',p,qualified?'Hajj medical screening clearance':'Hajj medical screening review required',message),80)},true);return result;
};

function appointmentManagement(){
  if(state.page!=='appointments'||!state.appointments.length||$('#appointmentManagement'))return;
  let a=state.appointments[0],p=patients.find(x=>x.name===a[1])||patients[0],host=$('.booking-layout');if(!host)return;
  host.insertAdjacentHTML('afterend',`<section class="section-card appointment-management" id="appointmentManagement"><div><small>CURRENT APPOINTMENT</small><strong>${a[0]} · ${a[1]}</strong><span>${a[2]} · ${a[5]} · ${a[6]}</span></div><div><button class="btn outline" id="amendAppointment">Amend</button><button class="btn ghost" id="cancelAppointment">Cancel</button></div></section>`);
  $('#amendAppointment').onclick=()=>openAppointmentChange(a,p);$('#cancelAppointment').onclick=()=>{let protectedBooking=a[4]==='VIP'||a[4]==='Walk-in';if(!protectedBooking&&new Date(`${a[5]}T${a[6].slice(0,5)}`).getTime()-Date.now()<86400000){toast('Standard appointment locked — changes are not permitted within 24 hours');return}a.status='Cancelled';let match=state.confirmedAppointments.find(x=>x.id===a[0]);if(match)match.status='Cancelled';appointmentKeys.delete(p.passport);notificationPreview('Appointment cancelled',p,'Hajj appointment cancelled',appointmentMessage('CANCELLED',{ref:a[0],p,purpose:a[2],venue:'Registered appointment venue',date:a[5],time:a[6]}))};
}

function openAppointmentChange(a,p){
  let protectedBooking=a[4]==='VIP'||a[4]==='Walk-in',modal=document.createElement('div');modal.className='modal';modal.innerHTML=`<form class="modal-card" id="changeAppointmentForm"><div class="modal-head"><div><h2>Amend appointment</h2><p class="sub">${protectedBooking?'Protected appointments are exempt from the 24-hour rule; the selected session must not have ended.':'Standard appointments may be changed only when the new and existing sessions are at least 24 hours away.'}</p></div><button type="button" class="iconbtn closeChange">×</button></div><div class="form-grid"><label class="field"><span>Date *</span><input class="input" id="changeDate" type="date" value="${a[5]}" required></label><label class="field"><span>Two-hour session *</span><select class="input" id="changeTime">${['08:00–10:00','10:00–12:00','12:00–14:00','14:00–16:00'].map(t=>`<option ${t===a[6]?'selected':''}>${t}</option>`).join('')}</select></label><label class="field span2"><span>Venue *</span><input class="input" id="changeVenue" value="Hajj Village Accra" required></label></div><div class="modal-actions"><span>SMS and email will be sent after amendment.</span><button class="btn primary">Save amendment</button></div></form>`;document.body.appendChild(modal);modal.querySelector('.closeChange').onclick=()=>modal.remove();$('#changeAppointmentForm').onsubmit=e=>{e.preventDefault();let date=$('#changeDate').value,time=$('#changeTime').value,starts=new Date(`${date}T${time.slice(0,5)}`);if((!protectedBooking&&starts.getTime()-Date.now()<86400000)||(protectedBooking&&starts.getTime()+7200000<=Date.now())){toast(protectedBooking?'Select a protected session that has not ended':'Select a standard session at least 24 hours from now');return}a[5]=date;a[6]=time;let match=state.confirmedAppointments.find(x=>x.id===a[0]);if(match){match.date=date;match.time=time}let venue=$('#changeVenue').value;modal.remove();notificationPreview('Appointment amended',p,'Hajj appointment amended',appointmentMessage('AMENDED',{ref:a[0],p,purpose:a[2],venue,date,time}))}
}

const notificationRenderBase=render;
render=function(){notificationRenderBase();if(state.role==='agent'&&state.page==='pilgrims'&&!$('#registerPilgrim')){let hero=$('.hero');if(hero){hero.insertAdjacentHTML('beforeend','<button class="btn primary" id="registerPilgrim">+ Register pilgrim</button>');$('#registerPilgrim').onclick=openEnhancedRegistration}}appointmentManagement()};
