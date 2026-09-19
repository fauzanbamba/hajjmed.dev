# HajjMed Ghana production platform

The complete source-code manifest is in `SOURCE-CODE-MANIFEST.md`. The controlled development and handover documentation is in `docs/`, beginning with `docs/00-DOCUMENT-CONTROL.md`.

Production-oriented foundation for the Hajj 2027 EMR. It is separate from the interactive UX prototype in `../hajjmed-emr`.

## Applications

- `apps/api`: Fastify API, Prisma/PostgreSQL, Redis-backed OTP, authorization, audit and clinical modules.
- `apps/mobile`: Expo/React Native application for pilgrims, clinicians, agents, administrators and the Medical Director.
- `packages/contracts`: Shared roles, appointment types, regions and API types.

## Local start

1. Copy `.env.example` to `.env` and replace every development secret.
2. Run `docker compose up -d`.
3. Run `pnpm install`.
4. Run `pnpm db:generate && pnpm db:migrate && pnpm db:seed`.
5. Run `pnpm dev:api` and `pnpm dev:mobile` in separate terminals.

The API defaults to `http://localhost:4000`; interactive documentation is exposed at `/docs` in development.

For the Docker-free portable PostgreSQL environment and verified development credentials, see `LOCAL-DEVELOPMENT.md`.

## Implemented security and clinical boundaries

- Passport number, phone, email and practitioner licence constraints prevent duplicate identity records.
- Pilgrim and agent access is patient/agency scoped; agents receive read-only records for their own pilgrims.
- Clinical writes are restricted to clinicians, administrators and the Medical Director.
- Administrators may override lower roles; only the Medical Director may override an administrator.
- Screening capacity is enforced transactionally per region and date, including the separate 10-person walk-in/VIP allocation.
- Appointment confirmations are queued for both pilgrim and agent. Connect the outbox worker to a procured SMS provider before production.
- Every sensitive read, write, login and override is written to a tamper-evident hash-chained audit log.

## Mobile testing

Set `EXPO_PUBLIC_API_URL` to the computer's LAN address (for example `http://192.168.1.20:4000/api/v1`) before starting Expo. The phone and computer must be able to reach each other. Production builds must use an HTTPS endpoint.

## Production warning

This repository is a build foundation, not regulatory approval. Before live health data is processed, complete the DPIA, clinical-rule validation, licensed penetration testing, identity-provider procurement, SMS/email provider configuration, object-storage hardening, disaster-recovery proof and Ghana/Saudi regulatory approvals described in the Production Foundation Pack.
