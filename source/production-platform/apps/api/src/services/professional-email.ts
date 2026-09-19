import type { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const professionalEmailDomain=process.env.PROFESSIONAL_EMAIL_DOMAIN?.trim().toLowerCase()||'hajjmed.gov.gh';

function slug(value:string){return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b(dr|doctor|nurse|mr|mrs|ms|prof)\b/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'.').replace(/^\.|\.$/g,'').slice(0,45)||'user'}

export async function allocateProfessionalEmail(input:{displayName:string;role:Role}){
  const roleBase:Partial<Record<Role,string>>={MEDICAL_DIRECTOR:'medical.director',ADMIN:'administrator'};
  const base=roleBase[input.role]||slug(input.displayName);let suffix=1;
  while(suffix<10000){const local=suffix===1?base:`${base}.${suffix}`,candidate=`${local}@${professionalEmailDomain}`;const exists=await prisma.user.findFirst({where:{professionalEmail:candidate},select:{id:true}});if(!exists)return candidate;suffix++}
  throw Object.assign(new Error('Unable to allocate a unique professional email address'),{statusCode:409,code:'PROFESSIONAL_EMAIL_EXHAUSTED'});
}
