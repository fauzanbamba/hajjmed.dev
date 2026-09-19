import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessCommunication } from './communication-policy.js';

const thread={pilgrimId:'pilgrim-a',organizationId:'agency-a'};

test('agent can access a conversation for its own organization',()=>assert.equal(canAccessCommunication({role:'AGENT',organizationId:'agency-a'},thread),true));
test('agent cannot access another organization conversation',()=>assert.equal(canAccessCommunication({role:'AGENT',organizationId:'agency-b'},thread),false));
test('pilgrim can access only their own conversation',()=>{assert.equal(canAccessCommunication({role:'PILGRIM',pilgrimId:'pilgrim-a'},thread),true);assert.equal(canAccessCommunication({role:'PILGRIM',pilgrimId:'pilgrim-b'},thread),false)});
test('allied health remains excluded from communications',()=>assert.equal(canAccessCommunication({role:'ALLIED_HEALTH'},thread),false));
