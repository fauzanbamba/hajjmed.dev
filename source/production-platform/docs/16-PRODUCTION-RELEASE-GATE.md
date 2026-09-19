# Production release gate

## Required launch controls

- [ ] Threat model complete
- [ ] Categorized access matrix complete
- [ ] DPIA approval complete
- [ ] Penetration test completed and remediated
- [ ] Clinical validation signed off
- [ ] Production secrets validated
- [ ] Backup and restore proven
- [ ] Monitoring and alerting active
- [ ] Migration rollback plan ready
- [ ] Production deployment approval signed

## Release gate command

Run the release gate before any production deployment:

- `node scripts/release-gate.mjs`
- `pnpm release:gate`

## Required environment flags

- `DEPLOYMENT_APPROVED=true`
- `CLINICAL_APPROVAL=true`
- `PEN_TEST_APPROVED=true`
- `DPIA_APPROVED=true`
- `ALLOW_PRODUCTION_MIGRATION=true`
- `MIGRATION_BACKUP_PATH=<path>`
