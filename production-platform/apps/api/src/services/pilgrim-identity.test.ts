import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePassport,pilgrimIdentityFingerprint } from './pilgrim-identity.js';

test('passport matching ignores case, spaces and punctuation',()=>{
  assert.equal(normalizePassport(' g-278 6087 '),'G2786087');
});

test('the same person produces the same identity fingerprint despite name formatting',()=>{
  const a=pilgrimIdentityFingerprint({surname:'Abdul-Rahman',givenNames:'Amina  Mariam',dateOfBirth:new Date('1981-06-03'),sex:'Female'});
  const b=pilgrimIdentityFingerprint({surname:'abdul rahman',givenNames:'amina-mariam',dateOfBirth:new Date('1981-06-03'),sex:'female'});
  assert.equal(a,b);
});

test('a materially different identity does not share the fingerprint',()=>{
  const a=pilgrimIdentityFingerprint({surname:'Sulemana',givenNames:'Amina',dateOfBirth:new Date('1981-06-03'),sex:'Female'});
  const b=pilgrimIdentityFingerprint({surname:'Sulemana',givenNames:'Amina',dateOfBirth:new Date('1982-06-03'),sex:'Female'});
  assert.notEqual(a,b);
});
