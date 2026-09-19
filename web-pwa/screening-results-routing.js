function screeningOutcomeIsCleared(value){
  let outcome=String(value||'').trim().toUpperCase();
  return outcome.startsWith('GREEN')||outcome.includes('CLEARED')||outcome.includes('TRAVEL READY');
}

function routeScreeningToResultsAndOrders(p,outcome){
  if(!p||screeningOutcomeIsCleared(outcome))return;
  state.patient=p;
  state.page='record';
  state.tab='results';
  addPortalNotification('clinician','Results and orders action required',`${p.name} · ${p.passport} · screening outcome ${outcome}. Review or order the required investigations.`,'high');
  addPortalNotification('leadership','Non-cleared screening routed to Results & Orders',`${p.name} · ${p.passport} · ${outcome}.`,'routine');
  render();
  toast(`${outcome}: redirected to Results & Orders`);
}

const screeningResultsRoutingBase=openScreeningEncounter;
openScreeningEncounter=function(){
  let result=screeningResultsRoutingBase();
  let modal=$$('.modal').at(-1),form=modal?.querySelector('form');
  let outcome=modal?.querySelector('#screeningOutcome,#reviewDecision');
  if(!form||!outcome||form.dataset.resultsRouting==='true')return result;
  form.dataset.resultsRouting='true';
  form.addEventListener('submit',()=>{
    let p=selectedPatient(),decision=outcome.value;
    if(!screeningOutcomeIsCleared(decision))setTimeout(()=>routeScreeningToResultsAndOrders(p,decision),850);
  },true);
  return result;
};

function applyChecklistResultsRouting(){
  if(state.page!=='record'||state.tab!=='screening'||state.role==='nurse')return;
  let save=$('#saveScreen');
  if(!save||save.dataset.resultsRouting==='true')return;
  save.dataset.resultsRouting='true';
  save.addEventListener('click',()=>{
    let selected=document.querySelector('.outcomes input[name="outcome"]:checked');
    let decision=selected?.closest('.outcome')?.textContent.trim()||state.patient.screen||state.patient.status;
    if(!screeningOutcomeIsCleared(decision))setTimeout(()=>routeScreeningToResultsAndOrders(state.patient,decision),120);
  });
}

const screeningResultsRoutingRender=render;
render=function(){screeningResultsRoutingRender();applyChecklistResultsRouting()};
