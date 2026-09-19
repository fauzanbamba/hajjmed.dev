import { createHash, createHmac, randomInt } from 'node:crypto';
import { config } from '../config.js';
export const normalizePassport=(v:string)=>v.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
export const normalizePhone=(v:string)=>v.replace(/\D/g,'').replace(/^0/,'233');
export const normalizeLicense=(v:string)=>v.trim().toUpperCase().replace(/\s+/g,'');
export const otpCode=()=>String(randomInt(100000,1000000));
export const otpHash=(code:string)=>createHmac('sha256',config.OTP_PEPPER).update(code).digest('hex');
export const sha256=(value:string)=>createHash('sha256').update(value).digest('hex');
export const safeMask=(value:string,kind:'sms'|'email')=>kind==='sms'?`+${value.slice(0,3)} ••• ••• ${value.slice(-3)}`:`${value[0]}••••@${value.split('@')[1]??'email'}`;
