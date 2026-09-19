#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required. Set it before running database backup.');
  process.exit(1);
}

const targetArg = process.argv[2] || `backups/postgres-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
const targetPath = path.resolve(process.cwd(), targetArg);
const targetDir = path.dirname(targetPath);

fs.mkdirSync(targetDir, { recursive: true });

try {
  execFileSync('pg_dump', ['--no-owner', '--no-privileges', '--format=plain', '--file', targetPath, databaseUrl], { stdio: 'inherit' });
  console.log(`Database backup created at ${targetPath}`);
} catch (error) {
  console.error('Backup failed. Ensure PostgreSQL client tools are installed and DATABASE_URL is valid.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
