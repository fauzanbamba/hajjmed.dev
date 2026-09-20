# Handover and continuation guide

## Reproduce the codebase

Install current LTS Node.js, pnpm 10, PostgreSQL 16 and Redis 7 (or Docker Desktop). From `hajjmed-platform`, copy `.env.example` to `.env`, replace secrets, run `pnpm install`, `pnpm db:generate`, apply migrations, seed only a development database, then run API and mobile processes.

## Verification commands

```text
pnpm lint
pnpm build
pnpm test
pnpm db:generate
```

Do not commit `.env`, database files, uploads or real patient data.

## Priority engineering backlog

1. Keep Supabase PostgreSQL as the primary hosted database. Prisma is the API ORM and migration tool, not a separate production database.
2. Complete the appointment and clinical data-access migration, including availability, capacity, screening, immunization, encounter, care-plan and certificate workflows.
3. Migrate communications, pharmacy, administration, notifications and audit writes behind domain data-access modules.
4. Apply the normalized Supabase schema and row-level security policies; verify foreign keys, unique constraints, indexes and service-role boundaries before cutover.
5. Add dual-read comparison and write-reconciliation checks, then remove Prisma fallback only after a rehearsed rollback and clean production evidence.
6. Convert the static web prototype into a framework application connected to the API.
7. Complete API models/routes for observations, diagnostic orders/results, documents, consents, medications and certificates.
8. Add notification workers with retry, templates, consent and delivery status.
9. Integrate assured identity, object storage and malware scanning.
10. Implement terminology/FHIR services and licensed catalogues.
11. Expand automated authorization, concurrency, E2E and clinical-rule tests.
12. Implement controlled offline mobile workflows and reconciliation.
13. Add production infrastructure-as-code, CI/CD, monitoring and recovery.

## Supabase migration gates

The migration is deliberately staged by bounded context. Each phase must preserve authorization, idempotency and audit behavior before the next phase starts.

1. **Foundation:** configure `SUPABASE_URL` and the service-role key; keep the service-role client server-only and fail closed when production configuration is incomplete.
2. **Identity:** migrate users, OTP challenges, trusted devices, sessions and refresh tokens; verify token hashing, expiry and revocation against Supabase rows.
3. **Pilgrims:** migrate pilgrim registration, scoped listing, detail reads and QR data; verify organization access and duplicate passport constraints.
4. **Appointments:** migrate availability reads and booking writes; preserve capacity checks, protected slots, follow-up rules, idempotency keys and cancellation windows.
5. **Clinical:** migrate screening, review, override, immunization, encounter, care-plan and fitness-certificate records; preserve clinical locks and leadership authorization.
6. **Operations:** migrate communications, pharmacy, notifications, admin reporting and audit events; preserve delivery retries, inventory transactions and immutable audit history.
7. **Cutover:** compare row counts and representative hashes, run authorization and concurrency tests, rehearse rollback, then disable Prisma fallback by configuration.

No phase is considered complete merely because a Supabase request succeeds. The phase is complete only when its constraints, authorization behavior, audit trail and rollback evidence have been verified.

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
