import test from 'node:test';
import assert from 'node:assert/strict';

import { validateRuntimeConfig } from './config.js';

const validProductionConfig = {
  NODE_ENV: 'production',
  PORT: 4000,
  DATABASE_URL: 'postgresql://postgres.project-ref:secret@pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true',
  DIRECT_URL: 'postgresql://postgres:secret@db.project-ref.supabase.co:5432/postgres?sslmode=require',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'aVeryStrongAccessSecretKey123456',
  JWT_REFRESH_SECRET: 'aDifferentRefreshSecretKey654321',
  OTP_PEPPER: 'AproductionPepperValueWithEnoughLength',
  OTP_DEMO_MODE: 'false',
  APP_ORIGIN: 'https://example.com',
  SUPABASE_URL: 'https://project-ref.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-1234567890',
} as const;

test('accepts a valid production configuration with Supabase settings', () => {
  assert.doesNotThrow(() => validateRuntimeConfig(validProductionConfig));
});

test('rejects placeholder Supabase secrets in production', () => {
  assert.throws(() => validateRuntimeConfig({
    ...validProductionConfig,
    SUPABASE_SERVICE_ROLE_KEY: 'replace-with-supabase-service-role-key',
  }), /placeholder|supabase/i);
});

test('requires HTTPS for production Supabase URL', () => {
  assert.throws(() => validateRuntimeConfig({
    ...validProductionConfig,
    SUPABASE_URL: 'http://project-ref.supabase.co',
  }), /HTTPS/i);
});
