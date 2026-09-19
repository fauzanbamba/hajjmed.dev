#!/usr/bin/env node

const env = process.env;

const required = ['DATABASE_URL'];
const missing = required.filter((key) => !env[key] || !env[key].trim());

if (missing.length) {
  console.error('Migration pre-check failed: missing required env values');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

if (env.NODE_ENV === 'production') {
  const allowProductionMigration = env.ALLOW_PRODUCTION_MIGRATION === 'true';
  const backupRecorded = !!env.MIGRATION_BACKUP_PATH && env.MIGRATION_BACKUP_PATH.trim().length > 0;

  if (!allowProductionMigration) {
    console.error('Migration pre-check failed: production migrations require ALLOW_PRODUCTION_MIGRATION=true');
    process.exit(1);
  }

  if (!backupRecorded) {
    console.error('Migration pre-check failed: production migrations require MIGRATION_BACKUP_PATH to be set');
    process.exit(1);
  }

  console.log('Production migration gate passed. Backup path recorded and explicit approval flag set.');
} else {
  console.log('Non-production environment: migration pre-check passed.');
}
