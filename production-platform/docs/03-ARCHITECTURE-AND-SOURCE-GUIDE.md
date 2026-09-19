# Architecture and source guide

## Logical architecture

Clients (web PWA and Expo mobile) call the HTTPS Fastify API. The API validates requests, authenticates JWTs, applies role/patient/agency policy, executes transactional business rules through Prisma, and records audit events. PostgreSQL is the system of record. Redis supports OTP/short-lived state. S3-compatible object storage is planned for photographs and clinical documents. Notification workers must deliver queued SMS/email through procured providers.

## Repository structure

```text
hajjmed-platform/
  apps/api/                 Fastify/Prisma backend
    prisma/                 schema, migrations, seed
    src/lib/                authorization, audit, crypto, database
    src/routes/             auth, pilgrims, appointments, clinical, admin
    src/services/           appointment policy and notifications
  apps/mobile/              Expo Router application
  packages/contracts/       shared TypeScript contracts
  docs/                     controlled development documentation
  docker-compose.yml        local-only supporting services
../hajjmed-emr/              responsive interactive web/PWA prototype
```

## Current implementation boundary

The web/PWA is deliberately retained as a rich interaction prototype. It uses JavaScript in-memory state and simulated documents/messages. It must be componentized and connected to authenticated API endpoints before production. The API and mobile app are the production foundation but do not yet implement every visible prototype workflow.

## Backend modules

- `auth.ts`: credentials and OTP challenge/verification.
- `authz.ts`: role hierarchy and patient/agency scoping.
- `pilgrims.ts`: unique passport/contact registration and scoped record access.
- `appointments.ts`: regional capacity, protected pool, idempotency and 24-hour policy.
- `clinical.ts`: screening, encounters and immunization duplicate control.
- `admin.ts`: administrative overrides and Medical Director certificate authentication.
- `audit.ts`: chained audit entries.
- `notifications.ts`: dual-channel notification outbox creation.

## Design principles

- Deny by default and enforce access server-side.
- Normalize and constrain unique identities at the database boundary.
- Use idempotency and transactions for booking and clinical writes.
- Separate clinical completion from governance authentication.
- Preserve history; amend/supersede rather than silently overwrite.
- Treat exports, QR viewing and break-glass access as audited events.

## Architecture decisions still required

- Cloud/hosting jurisdiction and vendor
- Certified identity provider and lifecycle provisioning
- SMS/email providers and delivery worker
- Object storage, malware scanning and DICOM strategy
- Terminology/FHIR server and licensing
- Offline mobile conflict-resolution model
- Observability/SIEM and immutable audit archive
- Backup vault and cross-region recovery
