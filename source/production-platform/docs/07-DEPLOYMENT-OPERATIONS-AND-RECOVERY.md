# Deployment, operations and recovery

## Environments

Maintain isolated development, test, clinical-validation, pilot and production environments. Never copy production clinical data into lower environments. Use synthetic or properly de-identified test data.

## Local development

Follow `../LOCAL-DEVELOPMENT.md`. Docker Compose is development-only. Replace all example credentials. The static PWA may be served from `../../hajjmed-emr` using a local HTTP server.

## Production topology

Recommended components: managed PostgreSQL with high availability and point-in-time recovery; managed Redis; encrypted object storage; multiple stateless API instances behind an HTTPS load balancer/WAF; notification workers; identity provider; monitoring/SIEM; backup vault; and CDN/static hosting for the web client.

## Deployment pipeline

1. Validate lockfile and clean install.
2. Lint, compile and test.
3. Scan dependencies, secrets, containers and infrastructure.
4. Build immutable signed artifacts.
5. Back up and dry-run database migration.
6. Deploy to validation environment and run smoke/contract tests.
7. Obtain release approval.
8. Deploy gradually with health checks and rollback criteria.
9. Verify audit, notifications, dashboards and data reconciliation.

## Database migration

Migrations are forward-controlled and reviewed. Take a verified backup before production migration. Test both migration and application rollback. Never edit an already-applied migration.

## Monitoring

Monitor availability, latency, error rate, database saturation, queue depth, OTP failures, notification delivery, authorization denials, break-glass events, audit-chain validation, certificate authentication, sync conflicts and backup success. Alerts require named owners and response times.

## Backup and recovery

Approve RPO/RTO through business-impact analysis. Encrypt backups, separate credentials and account, test restoration quarterly and rehearse total region/provider loss. A backup is not accepted until restoration and integrity are demonstrated.

## Downtime

Provide numbered paper/digital downtime forms, identity verification, timestamped clinical entries, medication/vaccine lot controls and a reconciliation process. Re-entered data must identify original author/time and reconciliation author. Duplicate checking is mandatory during recovery.

## Operational rehearsal

Simulate screening surge, lost phone/tablet, compromised account, SMS/email outage, laboratory interface failure, Saudi connectivity loss, emergency/evacuation, database failover and complete downtime. Record defects, owners and retest evidence.
