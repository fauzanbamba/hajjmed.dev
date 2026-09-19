# Migration and rollback gates

## Required migration controls

- [ ] Database backup taken before every production migration
- [ ] Migration rehearsal completed in validation environment
- [ ] Rollback plan reviewed before apply
- [ ] ALLOW_PRODUCTION_MIGRATION=true only after explicit approval
- [ ] Backup path recorded before apply
- [ ] No direct edits to already-applied migrations
- [ ] Post-migration integrity checks executed
- [ ] Production rollback rehearsal documented

## Operational gate

A production migration may proceed only when:

- [ ] a verified backup exists
- [ ] migration pre-check passes
- [ ] rollback procedure is ready
- [ ] application owners approve the change window
- [ ] database integrity checks are scheduled after apply
