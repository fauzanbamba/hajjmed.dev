import test from 'node:test';
import assert from 'node:assert/strict';
import {mayReviewRegulatoryHardRed,requiresRegulatoryHardRed} from './regulatory-screening-policy.js';
test('any Saudi regulatory exclusion requires protected RED',()=>{assert.equal(requiresRegulatoryHardRed([]),false);assert.equal(requiresRegulatoryHardRed(['RENAL_DIALYSIS']),true)});
test('clinicians and nurses cannot review protected RED',()=>{assert.equal(mayReviewRegulatoryHardRed('CLINICIAN'),false);assert.equal(mayReviewRegulatoryHardRed('NURSE'),false)});
test('only Administrator and Medical Director may review protected RED',()=>{assert.equal(mayReviewRegulatoryHardRed('ADMIN'),true);assert.equal(mayReviewRegulatoryHardRed('MEDICAL_DIRECTOR'),true);assert.equal(mayReviewRegulatoryHardRed('PHARMACIST'),false)});
