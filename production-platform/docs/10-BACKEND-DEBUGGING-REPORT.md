# HajjMed 2027 Backend Debugging Report

Date: 9 September 2026

## Scope

Static and executable checks covering authentication, role authorization, appointment policy, screening and vaccination writes, review routing, facility state, Prisma schema/migrations, clinical-entry locking, configuration safety, TypeScript syntax and deployment readiness.

## Confirmed defects corrected

1. Added server-side confirmed-appointment checks to screening and vaccination creation. Administrator and Medical Director retain audited override authority.
2. Added a dedicated screening-review endpoint. It requires a non-green original screening and a confirmed REVIEW appointment for ordinary clinical users.
3. Preserved duplicate-screening prevention and added duplicate-review prevention.
4. Added inactive-facility rejection for appointment booking, appointment amendment and clinical administration.
5. Corrected protected appointment distribution from 3+3+3+3 (12/day) to 3+3+2+2 (10/day).
6. Allowed a genuinely cancelled initial appointment to be rebooked while retaining the one-active-initial-appointment rule.
7. Required follow-up bookings to reference a non-green screening rather than any screening.
8. Added vaccine expiry-versus-administration validation.
9. Added NURSE and ALLIED_HEALTH as separate database roles and a migration, preventing inheritance of unrestricted doctor permissions.
10. Added session-status validation to protected routes so revoked, expired, disabled or role-changed sessions are rejected.
11. Added refresh-token rotation and logout/revocation endpoints.
12. Blocked OTP issuance for inactive accounts.
13. Added production configuration validation: separate JWT secrets, valid URLs/ports and prohibition of OTP demo mode in production.
14. Added database-aware liveness/readiness endpoints.
15. Added and retained the 24-hour clinical-entry lock policy test.
16. Added a backend Dockerfile, `.dockerignore` and API service to Docker Compose with migration-on-start and health checks.
17. Serialized audit hash-chain writes with a PostgreSQL advisory transaction lock to prevent concurrent chain forks.

## Verification completed

- All modified backend TypeScript files passed Node 24 TypeScript syntax parsing.
- Prisma schema and migration were inspected for the new role values.
- Appointment policy has a regression test asserting exactly ten protected slots per region per day.
- Existing authorization, appointment and clinical-entry-lock tests were reviewed.

## Environmental blocker

A clean pnpm install repeatedly failed because connections to the npm registry reset while retrieving the Expo/Babel dependency graph. Consequently, a clean TypeScript build, Prisma Client generation and the complete compiled test suite could not be certified in this session. Direct execution of TypeScript tests was also unsuitable because the source intentionally uses `.js` ESM specifiers resolved by the TypeScript build step.

Before production release, an IT engineer must run the following on a stable network:

```powershell
$env:CI='true'
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
pnpm test
pnpm lint
```

## Release gates still required

- Apply migrations to a disposable PostgreSQL database and run migration rollback/recovery rehearsal.
- Start PostgreSQL, Redis and object storage and execute API integration tests.
- Add full Results/Orders persistence and endpoint-level authorization tests for ALLIED_HEALTH.
- Add a dedicated nursing-assessment persistence model and endpoint; NURSE is intentionally denied doctor-only screening writes.
- Complete dual Administrator/Medical Director vaccination-certificate authentication in the production data model.
- Add SMS/email provider delivery, retry and dead-letter tests.
- Run SAST, dependency audit, penetration testing and Ghana regulatory/privacy assessment.

This repository remains a production foundation, not a clinically validated or regulator-approved deployed EMR.
