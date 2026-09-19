state.managedFacilities=state.managedFacilities||[
  {id:'FAC-001',name:'Hajj Village Accra',type:'Clinic',region:'Greater Accra',status:'Active'},
  {id:'FAC-002',name:'Hajj Village Tamale',type:'Clinic',region:'Northern',status:'Active'},
  {id:'FAC-003',name:'Regional Medical Screening Centre',type:'Screening centre',region:'Greater Accra',status:'Active'},
  {id:'FAC-004',name:'Designated Vaccination Centre',type:'Vaccination centre',region:'Greater Accra',status:'Active'},
  {id:'FAC-005',name:'Makkah Clinic',type:'Clinic',region:'Saudi Arabia',status:'Active'},
  {id:'FAC-006',name:'Mina Field Clinic',type:'Clinic',region:'Saudi Arabia',status:'Active'},
  {id:'FAC-007',name:'Arafat Field Clinic',type:'Clinic',region:'Saudi Arabia',status:'Active'}
];

function syncFacilityOptions(){
  facilityOptions.splice(0,facilityOptions.length,...state.managedFacilities.filter(x=>x.status==='Active').map(x=>x.name),'Other facility');
}

function facilityManagementRows(){
  return state.managedFacilities.map(f=>`<tr><td><strong>${f.name}</strong><small>${f.id}</small></td><td>${f.type}</td><td>${f.region}</td><td><span class="badge ${f.status==='Active'?'green':'gray'}">${f.status}</span></td><td><button class="btn outline toggleFacility" data-id="${f.id}">${f.status==='Active'?'Deactivate':'Activate'}</button></td></tr>`).join('');
}

function openFacilityManagement(){
  if(!['admin','medicaldirector'].includes(state.role)){controlBreach('facility management',state.patient,'Unauthorised role attempted facility configuration');return}
  let modal=document.createElement('div');modal.className='modal';
  modal.innerHTML=`<div class="modal-card registration-modal facility-manager"><div class="modal-head"><div><span class="eyebrow" style="color:var(--green2)">Leadership configuration</span><h2>Clinics and service centres</h2><p class="sub">Create and name any number of clinics, vaccination centres and screening centres.</p></div><button class="iconbtn closeFacilityManager">×</button></div><form id="facilityForm" class="form-grid"><label class="field span2"><span>Facility / centre name *</span><input class="input" id="facilityName" required placeholder="Enter the official facility name"></label><label class="field"><span>Facility type *</span><select class="input" id="facilityType" required><option>Clinic</option><option>Vaccination centre</option><option>Screening centre</option></select></label><label class="field"><span>Region / operational area *</span><input class="input" id="facilityRegion" required placeholder="e.g. Ashanti or Makkah"></label><label class="field"><span>Initial status *</span><select class="input" id="facilityStatus"><option>Active</option><option>Inactive</option></select></label><label class="field"><span>Internal code</span><input class="input" id="facilityCode" placeholder="Generated automatically if blank"></label><button class="btn primary span2">+ Create facility</button></form><div class="table-wrap facility-register"><table><thead><tr><th>Name</th><th>Type</th><th>Region / area</th><th>Status</th><th>Action</th></tr></thead><tbody id="facilityRows">${facilityManagementRows()}</tbody></table></div><div class="modal-actions"><span>All creation and status changes are recorded in the privileged audit trail.</span><button class="btn primary closeFacilityManager">Done</button></div></div>`;
  document.body.appendChild(modal);
  let refresh=()=>{modal.querySelector('#facilityRows').innerHTML=facilityManagementRows();modal.querySelectorAll('.toggleFacility').forEach(b=>b.onclick=()=>{let f=state.managedFacilities.find(x=>x.id===b.dataset.id);f.status=f.status==='Active'?'Inactive':'Active';syncFacilityOptions();addPortalNotification('leadership','Facility status changed',`${f.name} is now ${f.status}.`,'routine');refresh()})};
  modal.querySelector('#facilityForm').onsubmit=e=>{e.preventDefault();let name=$('#facilityName').value.trim();if(state.managedFacilities.some(x=>x.name.toLowerCase()===name.toLowerCase())){toast('A facility with this name already exists');return}let id=$('#facilityCode').value.trim()||`FAC-${String(state.managedFacilities.length+1).padStart(3,'0')}`;state.managedFacilities.push({id,name,type:$('#facilityType').value,region:$('#facilityRegion').value.trim(),status:$('#facilityStatus').value});syncFacilityOptions();addPortalNotification('leadership','Facility created',`${name} · ${$('#facilityType').value} · created by ${state.user.name}.`,'routine');e.target.reset();refresh();toast(`${name} created and added to facility selectors`)};
  modal.querySelectorAll('.closeFacilityManager').forEach(b=>b.onclick=()=>modal.remove());refresh();
}

syncFacilityOptions();
const facilityManagementRender=render;
render=function(){
  facilityManagementRender();
  if(!['admin','medicaldirector'].includes(state.role))return;
  document.querySelectorAll('.backend-action').forEach(b=>{if(b.dataset.action==='Clinics & locations')b.onclick=openFacilityManagement});
  if(state.page==='settings'&&!$('#manageFacilities')){let hero=$('.hero');hero?.insertAdjacentHTML('beforeend','<button class="btn primary" id="manageFacilities">Manage clinics & centres</button>');$('#manageFacilities').onclick=openFacilityManagement}
};
