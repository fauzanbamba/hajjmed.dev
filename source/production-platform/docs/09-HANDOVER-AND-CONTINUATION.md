# Handover and continuation guide

## Reproduce the codebase

Install current LTS Node.js, pnpm 12.4.1, PostgreSQL 16 and Redis 7 (or Docker Desktop). From `hajjmed-platform`, copy `.env.example` to `.env`, replace secrets, run `pnpm install`, `pnpm db:generate`, apply migrations, seed only a development database, then run API and mobile processes.

## Verification commands

```text
pnpm lint
pnpm build
pnpm test
pnpm db:generate
```

Do not commit `.env`, database files, uploads or real patient data.

## Priority engineering backlog

1. Convert the static web prototype into a framework application connected to the API.
2. Complete API models/routes for observations, diagnostic orders/results, documents, consents, medications and certificates.
3. Add notification workers with retry, templates, consent and delivery status.
4. Integrate assured identity, object storage and malware scanning.
5. Implement terminology/FHIR services and licensed catalogues.
6. Expand automated authorization, concurrency, E2E and clinical-rule tests.
7. Implement controlled offline mobile workflows and reconciliation.
8. Add production infrastructure-as-code, CI/CD, monitoring and recovery.

## New developer orientation

Read in order: root README, source manifest, SRS, architecture guide, security/safety plan, traceability matrix and local development guide. Review the Prisma schema before changing data behaviour. Review `authz.ts` before changing any route. Clinical-rule changes require documented clinical approval.

## Handover checklist

- Source and lockfile supplied
- Clean build/test evidence supplied
- `.env.example` supplied; secrets transferred separately
- Migrations and data dictionary supplied
- Open risks and backlog accepted
- Vendor accounts and contracts inventoried
- Architecture and clinical-rule decisions supplied
- DPIA/regulatory/penetration evidence supplied when available
- Support, incident and recovery ownership assigned
- Repository and deployment access transferred using named accounts

## Honest readiness statement

This handover is suitable for an IT team to continue engineering. It is not evidence that the system is clinically validated, penetration-tested, regulator-approved or ready to hold live medical data.
