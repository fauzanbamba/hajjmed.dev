#!/usr/bin/env node

const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'OTP_PEPPER',
  'APP_ORIGIN',
];

const missing = required.filter((key) => !process.env[key] || !process.env[key]?.trim());

if (missing.length) {
  console.error('Deployment validation failed. Missing required environment values:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.OTP_DEMO_MODE === 'true') {
  console.error('Deployment validation failed: OTP_DEMO_MODE must be false in production.');
  process.exit(1);
}

console.log('Deployment validation passed.');
