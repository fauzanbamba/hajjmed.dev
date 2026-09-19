const trustedDeviceEligibleRoles=['pilgrim','agent'];
const trustedDeviceStorageKey='hajjmed.trusted-device.v1';
function trustedDeviceLoginId(){return ($('#loginId')?.value||'').trim().toLowerCase()}
function readTrustedDevice(){try{return JSON.parse(localStorage.getItem(trustedDeviceStorageKey)||'null')}catch{return null}}
function hasTrustedHajjDevice(){let record=readTrustedDevice();return trustedDeviceEligibleRoles.includes(state.role)&&record?.role===state.role&&record?.loginId===trustedDeviceLoginId()&&Number(record?.expiresAt)>Date.now()}
function rememberTrustedHajjDevice(){localStorage.setItem(trustedDeviceStorageKey,JSON.stringify({role:state.role,loginId:trustedDeviceLoginId(),expiresAt:Date.now()+30*24*60*60*1000}))}

const trustedDeviceOtp=beginOtpLogin;
beginOtpLogin=function(){
  trustedDeviceOtp();
  if(!trustedDeviceEligibleRoles.includes(state.role))return;
  let modal=$('.otp-modal'),form=$('#otpForm');if(!modal||!form)return;
  form.querySelector('.otp-actions')?.insertAdjacentHTML('beforebegin','<label class="trusted-device-choice"><input type="checkbox" id="trustThisDevice"><span><strong>Trust this device for 30 days</strong><small>Use only on a private phone or computer. Password is still required at sign-in.</small></span></label>');
  form.addEventListener('submit',()=>{if($('#trustThisDevice')?.checked&&$('#otpCode')?.value===$('#demoOtp')?.textContent)rememberTrustedHajjDevice()},true);
};

const trustedDeviceLogin=login;
login=function(){
  trustedDeviceLogin();
  let form=$('#loginForm');if(!form)return;
  form.addEventListener('submit',e=>{if(!hasTrustedHajjDevice())return;e.preventDefault();e.stopImmediatePropagation();toast('Trusted device recognised — OTP bypassed');completeLogin()},true);
};
if(!state.user)login();
