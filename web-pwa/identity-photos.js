function identityPhoto(p,size='standard'){
  return `<div class="identity-photo ${size} ${p.photo?'verified':'pending'}">${p.photo?`<img src="${p.photo}" alt="Passport photograph of ${p.name}">`:`${pilgrimPicture(p)}<small>PHOTO<br>PENDING</small>`}<span>${p.photo?'Passport photo':'Verify photo'}</span></div>`;
}

function applyIdentityPhotos(root=document){
  root.querySelectorAll('[data-patient]').forEach(row=>{let p=patients.find(x=>x.id===row.dataset.patient),avatar=row.querySelector('.avatar');if(p&&avatar)avatar.outerHTML=identityPhoto(p,'thumbnail')});
  let top=root.querySelector('.detail-top .avatar');if(top&&state.patient)top.outerHTML=identityPhoto(state.patient,'profile');
  root.querySelectorAll('.openAppointment').forEach(button=>{let p=patients.find(x=>x.id===button.dataset.pilgrim),cell=button.closest('tr')?.children[1];if(p&&cell&&!cell.querySelector('.identity-photo'))cell.insertAdjacentHTML('afterbegin',identityPhoto(p,'thumbnail'))});
}

const photoPatientBanner=patientBanner;
patientBanner=function(p=selectedPatient()){let html=photoPatientBanner(p),holder=document.createElement('div');holder.innerHTML=html;let avatar=holder.querySelector('.avatar');if(avatar)avatar.outerHTML=identityPhoto(p,'profile');return holder.innerHTML};

function bookingIdentityPreview(){let select=$('#apptPilgrim'),form=$('#bookingForm');if(!form)return;let p=bookingPilgrim();if(!p)return;let old=$('#bookingIdentity');if(old)old.remove();let target=select?.closest('.field')||form.querySelector('.field:nth-of-type(5)');target?.insertAdjacentHTML('afterend',`<div class="booking-identity" id="bookingIdentity">${identityPhoto(p,'profile')}<div><small>IDENTITY CONFIRMATION</small><strong>${p.name}</strong><span>Passport ${p.passport||'not recorded'} · ${p.age} years · ${p.sex}</span></div></div>`)}

const identityRenderBase=render;
render=function(){identityRenderBase();applyIdentityPhotos();bookingIdentityPreview();let select=$('#apptPilgrim');if(select){let previous=select.onchange;select.onchange=e=>{if(previous)previous(e);bookingIdentityPreview()}}};

const identityIpsBase=showIPS;
showIPS=function(){identityIpsBase();let modal=$$('.modal').at(-1),avatar=modal?.querySelector('.ips-id .avatar');if(avatar&&state.patient)avatar.outerHTML=identityPhoto(state.patient,'profile')};

const identityQrBase=showCredentialQR;
showCredentialQR=function(p){identityQrBase(p);let modal=$$('.modal').at(-1);if(modal&&!modal.querySelector('.credential-photo'))modal.querySelector('.qr-code-large')?.insertAdjacentHTML('afterend',`<div class="credential-photo">${identityPhoto(p,'profile')}</div>`)};
