import test from 'node:test';import assert from 'node:assert/strict';import { regionalCapacity,ghanaRegions } from './index.js';
test('all 16 Ghana regions are configured',()=>assert.equal(ghanaRegions.length,16));
test('high-volume regions receive 100 scheduled slots',()=>{for(const r of ['Greater Accra','Ashanti','Northern'] as const)assert.equal(regionalCapacity(r),100)});
test('other regions receive 50 scheduled slots',()=>assert.equal(regionalCapacity('Volta'),50));
