import test from 'node:test';
import assert from 'node:assert/strict';

import { validateRuntimeConfig } from './config.js';

const validProductionConfig = {
  NODE_ENV: 'production',
  PORT: 4000,
  DATABASE_URL: 'postgresql://hajjmed:hajjmed_dev@localhost:5432/hajjmed?schema=public',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'aVeryStrongAccessSecretKey123456',
  JWT_REFRESH_SECRET: 'aDifferentRefreshSecretKey654321',
  OTP_PEPPER: 'AproductionPepperValueWithEnoughLength',
  OTP_DEMO_MODE: 'false',
  APP_ORIGIN: 'https://example.com',
} as const;

test('accepts a valid production configuration', () => {
  assert.doesNotThrow(() => validateRuntimeConfig(validProductionConfig));
});

test('rejects placeholder secrets in production', () => {
  assert.throws(() => validateRuntimeConfig({
    ...validProductionConfig,
    JWT_ACCESS_SECRET: 'replace-with-at-least-32-random-characters',
  }), /placeholder/i);
});

test('requires HTTPS origin in production', () => {
  assert.throws(() => validateRuntimeConfig({
    ...validProductionConfig,
    APP_ORIGIN: 'http://example.com',
  }), /HTTPS/i);
});
