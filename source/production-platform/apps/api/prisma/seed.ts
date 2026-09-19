import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
const passwordHash=await argon2.hash('Change-Me-Immediately-2027!');
const owner=await db.organization.upsert({where:{name_type:{name:'NADMED Consult',type:'SYSTEM_OWNER'}},update:{},create:{name:'NADMED Consult',type:'SYSTEM_OWNER',accredited:true}});
await db.user.upsert({where:{email:'director@hajjmed.local'},update:{displayName:'Dr. Abdul Samed Sulemana'},create:{email:'director@hajjmed.local',phoneNormalized:'233200000001',passwordHash,role:'MEDICAL_DIRECTOR',status:'ACTIVE',displayName:'Dr. Abdul Samed Sulemana',organizationId:owner.id}});
for(const f of [{name:'Hajj Village Accra',city:'Accra',countryCode:'GH'},{name:'Hajj Village Tamale',city:'Tamale',countryCode:'GH'},{name:'Makkah Clinic',city:'Makkah',countryCode:'SA'},{name:'Mina Clinic',city:'Mina',countryCode:'SA'},{name:'Arafat Clinic',city:'Arafat',countryCode:'SA'}])await db.facility.upsert({where:{name:f.name},update:f,create:f});
console.log('Seed complete. Medical Director: director@hajjmed.local');await db.$disconnect();
