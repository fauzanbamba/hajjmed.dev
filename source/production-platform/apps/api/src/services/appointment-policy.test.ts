import test from 'node:test';
import assert from 'node:assert/strict';
import {assertAppointmentTime,assertProtectedAppointmentTime,mayCreateFollowUp,mayUseProtectedSlots,protectedSessionCapacity,sessionIndex,standardSessionCapacity} from './appointment-policy.js';

test('only the four two-hour session starts are accepted',()=>{
  assert.equal(sessionIndex(new Date('2027-01-15T08:00:00Z')),0);
  assert.equal(sessionIndex(new Date('2027-01-15T14:00:00Z')),3);
  assert.equal(sessionIndex(new Date('2027-01-15T09:00:00Z')),-1);
});
test('appointments require 24 hours notice',()=>{
  assert.throws(()=>assertAppointmentTime(new Date('2027-01-02T07:59:00Z'),new Date('2027-01-01T08:00:00Z')),/24 hours/);
  assert.doesNotThrow(()=>assertAppointmentTime(new Date('2027-01-02T08:00:00Z'),new Date('2027-01-01T08:00:00Z')));
});
test('protected appointments are exempt from 24 hours notice but retain session controls',()=>{
  assert.doesNotThrow(()=>assertProtectedAppointmentTime(new Date('2027-01-01T08:00:00Z'),new Date('2027-01-01T08:30:00Z')));
  assert.throws(()=>assertProtectedAppointmentTime(new Date('2027-01-01T09:00:00Z'),new Date('2027-01-01T08:30:00Z')),/two-hour session/);
  assert.throws(()=>assertProtectedAppointmentTime(new Date('2027-01-01T08:00:00Z'),new Date('2027-01-01T10:00:00Z')),/session has ended/);
});
test('daily standard capacity is distributed across sessions',()=>{
  assert.deepEqual([0,1,2,3].map(i=>standardSessionCapacity('Volta',i)),[13,13,12,12]);
  assert.deepEqual([0,1,2,3].map(i=>standardSessionCapacity('Northern',i)),[25,25,25,25]);
});
test('protected and follow-up authority is restricted',()=>{
  assert.equal(mayUseProtectedSlots('CLINICIAN'),false);assert.equal(mayUseProtectedSlots('ADMIN'),true);
  assert.equal(mayCreateFollowUp('AGENT'),false);assert.equal(mayCreateFollowUp('CLINICIAN'),true);
});
test('protected capacity totals exactly ten slots per region per day',()=>{
  assert.deepEqual([0,1,2,3].map(protectedSessionCapacity),[3,3,2,2]);
});
