# HajjMed 2027 Production Launch Package

## 1. Purpose

This package contains the practical production launch gate for the HajjMed 2027 platform. It is intended to reduce risk before production deployment and to clearly separate development, pilot and production status.

## 2. What is required before production launch

The platform must satisfy all of the following:

- Production environments are isolated from development and test
- TLS, WAF, DDoS and private networking are configured
- PostgreSQL and Redis are production-managed and monitored
- Secrets are stored outside the repo and never left as placeholders
- OTP demo mode is disabled
- Authentication and authorization for admin and medical director roles are validated
- Audit trails are complete and monitored
- Backup and restore have been tested
- Disaster recovery and downtime procedures are documented and rehearsed
- Clinical validation has been signed off
- Security review and penetration test have been completed and remediated
- DPIA and regulatory review are complete
- Production release sign-off is documented

## 3. Required environment variables

Set these before production deployment:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public
REDIS_URL=redis://<host>:6379
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<different-strong-random-secret>
OTP_PEPPER=<strong-random-pepper>
OTP_DEMO_MODE=false
APP_ORIGIN=https://<production-domain>
DEPLOYMENT_APPROVED=true
CLINICAL_APPROVAL=true
PEN_TEST_APPROVED=true
DPIA_APPROVED=true
ALLOW_PRODUCTION_MIGRATION=true
MIGRATION_BACKUP_PATH=/path/to/backup.sql
```

## 4. Required launch commands

From the project root:

```
node scripts/check-prod-env.mjs
node scripts/deploy-check.mjs
node scripts/healthcheck.mjs
node scripts/migration-precheck.mjs
node scripts/release-gate.mjs
```

Or through pnpm:

```
pnpm env:check
pnpm deploy:check
pnpm healthcheck
pnpm migration:precheck
pnpm release:gate
```

## 5. Launch gate decision

Production launch is allowed only when all of the following are true:

- Threat model accepted
- Access matrix complete
- DPIA approved
- Penetration test passed
- Clinical validation signed off
- Recovery and backup proof accepted
- Monitoring and alerting active
- Release gate command passes
- Final deployment approval is signed

## 6. Go / No-Go rule

- GO only if every required approval and control is complete
- NO-GO if any required gate is missing, especially security, privacy, clinical validation, or backup/restore evidence

## 7. Final note

This package is the operational and technical launch gate for the project. It is a practical release guardrail and not a shortcut around required legal, clinical and security sign-off.
