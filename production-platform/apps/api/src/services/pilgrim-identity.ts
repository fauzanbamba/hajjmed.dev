import { createHash } from 'node:crypto';

export function normalizePassport(value:string){
  return value.toUpperCase().replace(/[^A-Z0-9]/g,'');
}

export function normalizeIdentityName(value:string){
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
}

export function pilgrimIdentityFingerprint(input:{surname:string;givenNames:string;dateOfBirth:Date;sex:string}){
  const date=input.dateOfBirth.toISOString().slice(0,10);
  const canonical=[normalizeIdentityName(input.surname),normalizeIdentityName(input.givenNames),date,input.sex.toUpperCase()].join('|');
  return createHash('sha256').update(canonical).digest('hex');
}
