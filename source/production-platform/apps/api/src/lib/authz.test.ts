import test from 'node:test';import assert from 'node:assert/strict';import { canOverride } from './authz.js';
test('Medical Director can override administrators',()=>assert.equal(canOverride('MEDICAL_DIRECTOR','ADMIN'),true));
test('administrator cannot override Medical Director',()=>assert.equal(canOverride('ADMIN','MEDICAL_DIRECTOR'),false));
test('equal roles cannot override each other',()=>assert.equal(canOverride('ADMIN','ADMIN'),false));
