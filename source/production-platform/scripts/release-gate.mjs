#!/usr/bin/env node

const env = process.env;

const required = [
  'NODE_ENV',
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'OTP_PEPPER',
  'APP_ORIGIN',
  'DEPLOYMENT_APPROVED',
  'CLINICAL_APPROVAL',
  'PEN_TEST_APPROVED',
  'DPIA_APPROVED',
  'MIGRATION_BACKUP_PATH',
  'ALLOW_PRODUCTION_MIGRATION',
];

const failures = [];

for (const key of required) {
  if (!env[key] || !env[key].trim()) {
    failures.push(`${key} is required`);
  }
}

if (env.NODE_ENV === 'production') {
  if (env.OTP_DEMO_MODE === 'true') {
    failures.push('OTP_DEMO_MODE must be false in production');
  }

  if (env.APP_ORIGIN && !/^https:\/\//i.test(env.APP_ORIGIN)) {
    failures.push('APP_ORIGIN must use HTTPS in production');
  }

  if (env.JWT_ACCESS_SECRET && env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    failures.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }

  const requiredFlags = ['DEPLOYMENT_APPROVED', 'CLINICAL_APPROVAL', 'PEN_TEST_APPROVED', 'DPIA_APPROVED', 'ALLOW_PRODUCTION_MIGRATION'];
  for (const key of requiredFlags) {
    if (env[key] !== 'true') {
      failures.push(`${key} must be true before production release`);
    }
  }

  if (!env.MIGRATION_BACKUP_PATH || !env.MIGRATION_BACKUP_PATH.trim()) {
    failures.push('MIGRATION_BACKUP_PATH must be set before production release');
  }
}

if (failures.length) {
  console.error('Production release gate FAILED.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Production release gate passed.');
