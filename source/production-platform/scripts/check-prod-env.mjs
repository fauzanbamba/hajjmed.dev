#!/usr/bin/env node

const env = process.env;

const placeholderPattern = /replace-with|example|demo|changeme|your-secret|localhost:9000|localhost:5432/i;

if (env.NODE_ENV === 'production') {
  const checks = [
    ['JWT_ACCESS_SECRET', env.JWT_ACCESS_SECRET],
    ['JWT_REFRESH_SECRET', env.JWT_REFRESH_SECRET],
    ['OTP_PEPPER', env.OTP_PEPPER],
    ['APP_ORIGIN', env.APP_ORIGIN],
  ];

  const failures = [];

  for (const [name, value] of checks) {
    if (!value || value.trim().length === 0) {
      failures.push(`${name} is missing`);
      continue;
    }

    if (placeholderPattern.test(value)) {
      failures.push(`${name} contains a placeholder value`);
    }
  }

  if (env.OTP_DEMO_MODE === 'true') {
    failures.push('OTP_DEMO_MODE must be false in production');
  }

  if (env.APP_ORIGIN && !/^https:\/\//i.test(env.APP_ORIGIN)) {
    failures.push('APP_ORIGIN must use HTTPS in production');
  }

  if (failures.length) {
    console.error('Production safety check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Production environment safety check passed.');
} else {
  console.log('Non-production environment detected; production safety check skipped.');
}
