function qrCredentialDownloadMarkup(p){return `<article class="print-card"><header><div><b>HajjMed Ghana</b><span>UNIFIED HAJJ QR CREDENTIAL</span></div><strong>${p.id}</strong></header><section class="identity"><div class="photo">${pilgrimPicture(p)}</div><div><h2>${p.name}</h2><p>${p.age} years · ${p.sex} · ${p.region} Region</p><p>Passport: ${p.passport} · ${p.agent}</p></div><div class="verify"><img src="${qrUrl(p)}" alt="Unified Hajj QR credential"></div></section><section class="card-grid"><div><small>MEDICAL HISTORY</small><b>${p.condition}</b></div><div><small>ALLERGIES</small><b>No known drug allergies</b></div><div><small>CURRENT MEDICATIONS</small><b>${medicineFor(p)}</b></div><div><small>VACCINATION RECORD</small><b>MenACWY: ${p.vax} · Yellow fever recorded</b></div><div><small>FITNESS CERTIFICATE</small><b>${certificateEligible(p)?certificateNo(p):'Not yet released'}</b></div><div><small>CREDENTIAL STATUS</small><b>Active · Medical screening cleared</b></div></section><footer><span>Scan to retrieve the authorised current health summary</span><span>Hajj 2027</span></footer></article>`}

const sharedQrShowBase=showCredentialQR;
showCredentialQR=function(p){
  if(state.role==='agent'&&p.agent!==demoAgentName){toast('QR access denied — pilgrim is not assigned to this agency');return}
  if(state.role==='pilgrim'&&p.id!==patients[0].id){toast('QR access denied — only your own credential is available');return}
  sharedQrShowBase(p);if(!qrEligible(p))return;
  let modal=$$('.modal').at(-1),actions=modal?.querySelector('.qr-note');if(!modal||!actions)return;
  actions.insertAdjacentHTML('afterend',`<div class="modal-actions"><span>Read only · ${state.role==='agent'?'assigned-agent access':'personal pilgrim access'}</span><button class="btn primary" id="downloadUnifiedQR">Download / print QR credential</button></div>`);
  $('#downloadUnifiedQR').onclick=()=>downloadable(`Unified Hajj QR Credential ${p.id}`,qrCredentialDownloadMarkup(p));
};

function addSharedQrAccess(){
  if(!['agent','pilgrim'].includes(state.role)||!['record','myhealth'].includes(state.page)||!state.patient)return;
  let top=$('.detail-top');if(!top||$('#sharedQrCredential'))return;let eligible=qrEligible(state.patient);
  top.insertAdjacentHTML('beforeend',`<button class="btn ${eligible?'primary':'outline'}" id="sharedQrCredential" ${eligible?'':'disabled'}>${icon('screen')} ${eligible?'Open unified Hajj QR':'QR pending clearance'}</button>`);
  if(eligible)$('#sharedQrCredential').onclick=()=>showCredentialQR(state.patient);
}

const sharedQrRenderBase=render;
render=function(){sharedQrRenderBase();addSharedQrAccess()};
