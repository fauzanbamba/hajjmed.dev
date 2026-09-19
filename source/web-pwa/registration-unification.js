function standardizePilgrimRegistration(){
  let button=$('#createPilgrimAccount');if(button){button.textContent='Register pilgrim';button.onclick=openUnifiedPilgrimRegistration}
  let registryButton=$('#registerPilgrim');if(registryButton){registryButton.textContent='+ Register pilgrim';registryButton.onclick=openUnifiedPilgrimRegistration}
}

function openUnifiedPilgrimRegistration(){
  openEnhancedRegistration();let modal=$$('.modal').at(-1),form=modal?.querySelector('#passportForm');if(!form)return;
  let heading=modal.querySelector('.modal-head h2'),eyebrow=modal.querySelector('.modal-head .eyebrow'),submit=form.querySelector('.modal-actions .btn.primary');
  if(heading)heading.textContent='Register pilgrim';
  if(eyebrow)eyebrow.textContent='HajjMed 2027 pilgrim registration';
  if(submit)submit.textContent='Verify identity & register pilgrim';
  modal.querySelector('.modal-head .sub').textContent='This single form creates the pilgrim’s master record and portal account using the same verified information.';
  let note=form.querySelector('.modal-actions span');if(note)note.textContent='Registration creates one auditable pilgrim record and activates portal access.';
}

const unifiedRegistrationLogin=login;
login=function(){unifiedRegistrationLogin();standardizePilgrimRegistration()};

const unifiedRegistrationRender=render;
render=function(){unifiedRegistrationRender();standardizePilgrimRegistration()};

standardizePilgrimRegistration();
