#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const inputPath = process.argv[2];

if (!databaseUrl) {
  console.error('DATABASE_URL is required. Set it before running the database restore.');
  process.exit(1);
}

if (!inputPath) {
  console.error('Usage: node scripts/restore-db.mjs <dump.sql>');
  process.exit(1);
}

try {
  execFileSync('psql', [databaseUrl, '-f', inputPath], { stdio: 'inherit' });
  console.log(`Database restored from ${inputPath}`);
} catch (error) {
  console.error('Restore failed. Ensure psql is installed and the dump file exists.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
