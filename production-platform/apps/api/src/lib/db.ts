import { requireSupabase } from './supabase.js';
import { randomUUID } from 'node:crypto';

export type JsonValue = any;

const relationMap: Record<string, string> = {
  user: 'User', organization: 'Organization', users: 'User', practitioner: 'Practitioner', pilgrim: 'Pilgrim',
  screenings: 'Screening', screening: 'Screening', allergies: 'Allergy', medications: 'Medication', immunizations: 'Immunization',
  encounters: 'Encounter', carePlan: 'CarePlan', facility: 'Facility', appointment: 'Appointment', appointments: 'Appointment',
  clinicalDocuments: 'ClinicalDocument', messages: 'CommunicationMessage', openedBy: 'User', assignedTo: 'User',
  inventoryItem: 'InventoryItem', items: 'RequisitionItem', requisition: 'Requisition',
};

function relationSelect(name: string, spec: any): string {
  const table = relationMap[name] ?? name;
  if (spec === true) return `${name}:"${table}"(*)`;
  if (spec?.select) return `${name}:"${table}"(${fields(spec.select)})`;
  if (spec?.include) return `${name}:"${table}"(${fields(undefined, spec.include)})`;
  return `${name}:"${table}"(*)`;
}
function fields(select?: any, include?: any): string {
  const parts: string[] = ['*'];
  const source = select ?? include;
  if (source) {
    const explicit = Object.keys(source).filter(k => source[k] !== false && !relationMap[k] && k !== 'user' && k !== 'organization' && k !== 'pilgrim' && k !== 'facility' && k !== 'appointment' && k !== 'practitioner' && k !== 'screenings' && k !== 'allergies' && k !== 'medications' && k !== 'immunizations' && k !== 'encounters' && k !== 'carePlan' && k !== 'messages' && k !== 'openedBy' && k !== 'assignedTo' && k !== 'inventoryItem' && k !== 'items');
    if (explicit.length) parts.splice(0, 1, ...explicit);
    for (const [k,v] of Object.entries(source)) if (v && relationMap[k]) parts.push(relationSelect(k,v));
  } else if (include) for (const [k,v] of Object.entries(include)) if (v) parts.push(relationSelect(k,v));
  return [...new Set(parts)].join(',');
}

function applyWhere(q: any, where: any): any {
  if (!where) return q;
  for (const [key, value] of Object.entries(where)) {
    if (key === 'AND') { for (const w of value as any[]) q = applyWhere(q,w); continue; }
    if (key === 'OR') { /* handled after retrieval */ continue; }
    if (key === 'NOT') continue;
    if (relationMap[key] && typeof value === 'object') continue;
    if (value === undefined) continue;
    if (value === null) { q = q.is(key, null); continue; }
    if (typeof value !== 'object' || value instanceof Date) { q = q.eq(key, value instanceof Date ? value.toISOString() : value); continue; }
    if ('equals' in value) q = value.equals === null ? q.is(key,null) : q.eq(key,value.equals instanceof Date ? value.equals.toISOString():value.equals);
    if ('in' in value) q = q.in(key, value.in);
    if ('notIn' in value) q = q.not(key, 'in', `(${(value as any).notIn.join(',')})`);
    if ('not' in value && value.not !== null && typeof value.not !== 'object') q = q.neq(key,value.not);
    if ('gt' in value) q = q.gt(key,value.gt instanceof Date?value.gt.toISOString():value.gt);
    if ('gte' in value) q = q.gte(key,value.gte instanceof Date?value.gte.toISOString():value.gte);
    if ('lt' in value) q = q.lt(key,value.lt instanceof Date?value.lt.toISOString():value.lt);
    if ('lte' in value) q = q.lte(key,value.lte instanceof Date?value.lte.toISOString():value.lte);
    if ('contains' in value) q = (value as any).mode === 'insensitive' ? q.ilike(key, `%${value.contains}%`) : q.like(key, `%${value.contains}%`);
    if ('startsWith' in value) q = (value as any).mode === 'insensitive' ? q.ilike(key, `${value.startsWith}%`) : q.like(key, `${value.startsWith}%`);
  }
  return q;
}

function postFilter(row: any, where: any): boolean {
  if (!where) return true;
  for (const [key,v] of Object.entries(where)) {
    if (key === 'AND' && !(v as any[]).every(x=>postFilter(row,x))) return false;
    if (key === 'OR' && !(v as any[]).some(x=>postFilter(row,x))) return false;
    if (key === 'NOT' && postFilter(row,v)) return false;
    if (relationMap[key]) {
      const child = row[key];
      const arr = Array.isArray(child) ? child : [child];
      if (!arr.some(x=>postFilter(x,v))) return false;
      continue;
    }
    if (v === undefined) continue;
    const actual=row[key];
    if (v && typeof v==='object' && !(v instanceof Date)) {
      if ('in' in v && !(v.in as any[]).includes(actual)) return false;
      if ('not' in v && actual===v.not) return false;
      if ('contains' in v && !String(actual??'').toLowerCase().includes(String(v.contains).toLowerCase())) return false;
      if ('gte' in v && !(actual>=(v as any).gte)) return false;
      if ('lte' in v && !(actual<=(v as any).lte)) return false;
      if ('gt' in v && !(actual>(v as any).gt)) return false;
      if ('lt' in v && !(actual<(v as any).lt)) return false;
    } else if (actual !== v) return false;
  }
  return true;
}

class Model {
  constructor(private readonly table: string) {}
  async findMany(opts:any={}) {
    const {data,error}=await applyQuery(this.table,opts); if(error) throw error;
    let rows=(data??[]).filter(r=>postFilter(r,opts.where));
    if(opts.orderBy){const orders=Array.isArray(opts.orderBy)?opts.orderBy:[opts.orderBy]; rows.sort((a:any,b:any)=>{for(const o of orders){const [k,d]=Object.entries(o)[0] as [string,any]; const av=a[k],bv=b[k]; if(av===bv)continue; return (av>bv?1:-1)*(d==='desc'?-1:1);}return 0;});}
    if(opts.skip) rows=rows.slice(opts.skip); if(opts.take) rows=rows.slice(0,opts.take); return rows;
  }
  async findFirst(opts:any={}) { const rows=await this.findMany({...opts,take:1}); return rows[0]??null; }
  async findUnique(opts:any={}) { const rows=await this.findMany({...opts,take:1}); return rows[0]??null; }
  async findUniqueOrThrow(opts:any={}) { const r=await this.findUnique(opts); if(!r) throw Object.assign(new Error(`${this.table} record not found`),{code:'P2025'}); return r; }
  async count(opts:any={}) { const rows=await this.findMany({...opts}); return rows.length; }
  async create(opts:any) { const data0=await materializeCreate(this.table, opts.data); const {data,error}=await requireSupabase().from(this.table).insert(data0).select(fields(opts.select,opts.include)).single(); if(error)throw error; return data; }
  async createMany(opts:any) { const {data,error}=await requireSupabase().from(this.table).insert((opts.data??[]).map(serialize)); if(error)throw error; return {count:opts.data?.length??0,data}; }
  async update(opts:any) { const filter=opts.where??{}; const nested=opts.data?.user?.update; const clean={...opts.data}; delete clean.user; let q=requireSupabase().from(this.table).update(await resolveUpdate(this.table,filter,clean)); q=applyWhere(q,filter); const {data,error}=await q.select(fields(opts.select,opts.include)).single(); if(error)throw error; if(nested && (data as any)?.userId) await new Model('User').update({where:{id:(data as any).userId},data:nested}); return data; }
  async updateMany(opts:any) { let q=requireSupabase().from(this.table).update(await resolveUpdate(this.table,opts.where,opts.data)); q=applyWhere(q,opts.where); const {data,error}=await q.select(); if(error)throw error; return {count:data?.length??0}; }
  async upsert(opts:any) { const unique=Object.keys(opts.where??{}); const payload=serialize(opts.create); const existing=await this.findUnique({where:opts.where}); if(existing) return this.update({where:opts.where,data:opts.update}); const {data,error}=await requireSupabase().from(this.table).insert(payload).select(fields(opts.select,opts.include)).single(); if(error)throw error; return data; }
  async groupBy(opts:any) { const rows=await this.findMany(opts); const by=opts.by??[]; const groups=new Map<string,any>(); for(const r of rows){const key=JSON.stringify(by.map((k:string)=>r[k])); if(!groups.has(key))groups.set(key,{...Object.fromEntries(by.map((k:string)=>[k,r[k]])),_count:{_all:0}});groups.get(key)._count._all++;} return [...groups.values()]; }
}

const tablesWithCreatedAt=new Set(['Organization','User','Practitioner','Pilgrim','CarePlan','CommunicationThread','CommunicationMessage','Appointment','Screening','ScreeningFinding','Encounter','Allergy','Medication','Immunization','ClinicalDocument','OtpChallenge','TrustedDevice','Session','Notification','InventoryItem','Requisition']);
const tablesWithUpdatedAt=new Set(['Organization','User','Practitioner','Pilgrim','CarePlan','CommunicationThread','Appointment','Encounter','InventoryItem','Requisition']);
async function materializeCreate(table:string,data:any){ const d=serialize(data); if(d.id===undefined)d.id=randomUUID(); if(tablesWithCreatedAt.has(table)&&d.createdAt===undefined)d.createdAt=new Date().toISOString(); if(tablesWithUpdatedAt.has(table)&&d.updatedAt===undefined)d.updatedAt=new Date().toISOString(); if(table==='Practitioner' && data.user?.create){ const u=await new Model('User').create({data:data.user.create}); d.userId=(u as any).id; } if(table==='Pilgrim' && data.user?.create){ const u=await new Model('User').create({data:data.user.create}); d.userId=(u as any).id; } return d; }
function serialize(data:any):any { if(data===undefined)return undefined; if(data instanceof Date)return data.toISOString(); if(Array.isArray(data))return data.map(serialize); if(data&&typeof data==='object'){const out:any={};for(const [k,v] of Object.entries(data)){if(v&&typeof v==='object'&&!Array.isArray(v)){if('increment' in (v as any))out[k]=(v as any).increment;else if('decrement' in (v as any))out[k]=-(v as any).decrement;else if('set' in (v as any))out[k]=(v as any).set;else if('create' in (v as any)||'update' in (v as any))continue;else out[k]=serialize(v);}else out[k]=serialize(v);}return out;}return data; }
async function resolveUpdate(table:string,where:any,data:any){const resolved=serialize(data); for(const [k,v] of Object.entries(data??{})){if(v&&typeof v==='object'&&('increment' in (v as any)||'decrement' in (v as any))){const current=await new Model(table).findUnique({where});resolved[k]=(current?.[k]??0)+((('increment' in (v as any)) ? 1 : -1) * ((v as any).increment ?? (v as any).decrement));}} return resolved;}
async function applyQuery(table:string,opts:any){let q=requireSupabase().from(table).select(fields(opts.select,opts.include)); q=applyWhere(q,opts.where); if(opts.orderBy&&!Array.isArray(opts.orderBy)){const [k,d]=Object.entries(opts.orderBy)[0] as [string,any];q=q.order(k,{ascending:d!=='desc'});} else if(Array.isArray(opts.orderBy))for(const o of opts.orderBy){const [k,d]=Object.entries(o)[0] as [string,any];q=q.order(k,{ascending:d!=='desc'});} if(opts.take&&!opts.skip)q=q.limit(opts.take); return q; }

const models=['Organization','User','Practitioner','Pilgrim','CarePlan','CommunicationThread','CommunicationMessage','Facility','Appointment','Screening','ScreeningFinding','Encounter','Allergy','Medication','Immunization','ClinicalDocument','OtpChallenge','TrustedDevice','Session','AuditEvent','RegionalDailyCapacity','Notification','InventoryItem','MedicationDispense','Requisition','RequisitionItem'];
const db:any={ $transaction: async (fn:any)=>fn(db), $disconnect: async()=>{} };
for(const m of models) db[m[0].toLowerCase()+m.slice(1)] = new Model(m);
export { db };
