import test from 'node:test';
import assert from 'node:assert/strict';
import { fitnessCertificateAuthenticated,unifiedQrAuthenticated } from './credential-policy.js';

const at=new Date('2026-09-21T00:00:00Z');
test('Administrator authentication alone releases the fitness certificate',()=>assert.equal(fitnessCertificateAuthenticated({authenticatedAt:null,administratorAuthenticatedAt:at}),true));
test('Medical Director authentication alone releases the fitness certificate',()=>assert.equal(fitnessCertificateAuthenticated({authenticatedAt:at,administratorAuthenticatedAt:null}),true));
test('unified QR remains subject to both authentications',()=>{assert.equal(unifiedQrAuthenticated({authenticatedAt:at,administratorAuthenticatedAt:null}),false);assert.equal(unifiedQrAuthenticated({authenticatedAt:at,administratorAuthenticatedAt:at}),true)});
