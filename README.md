# HajjMed Ghana

**Version 0.2.0 — development foundation for Hajj 2027**

HajjMed is a production-oriented medical screening and healthcare-coordination platform for Ghanaian pilgrims preparing for Hajj 2027. It supports the operational journey from registration and appointments through clinical screening, immunization, care planning, medical-fitness certification, pharmacy operations, communications and administrative oversight.

> **Development status:** this repository is a software foundation and handover package. It is not approved for live medical data, clinical operation, or regulatory production deployment.

## What is included

- Pilgrim registration, identity management and organization/agent access controls
- Appointment capacity management, including protected walk-in/VIP workflows
- Role-based authentication, OTP and trusted-device controls
- Clinical screening, encounters, immunizations, care plans and hard-red screening controls
- Medical-fitness certificate and unified QR credential workflows with leadership authentication
- Pharmacy inventory and dispensing controls
- Secure communications, notifications, audit logging and administrative exports
- A responsive browser/PWA prototype, TypeScript API, mobile application, shared contracts, database schema, migrations and handover documentation

## Repository layout

- `00-START-HERE.md` — handover entry point and recommended reading order
- `production-platform/` — runnable pnpm workspace
  - `apps/api/` — Fastify API, Prisma/PostgreSQL, Redis-backed workflows and authorization
  - `apps/mobile/` — Expo/React Native mobile application
  - `packages/contracts/` — shared TypeScript contracts and business types
  - `docs/` — architecture, security, validation, deployment and handover documentation
- `web-pwa/` — responsive browser/PWA prototype with demonstration data
- `source/` — curated source and handover materials
- `reference-documents/` — product and foundation reference material

## Technology

TypeScript, Fastify, Prisma, PostgreSQL, Supabase, Redis, MinIO-compatible object storage, Expo, React Native, Zod, Docker Compose and pnpm.

## Local development

Use synthetic data only.

### Requirements

- Node.js LTS
- pnpm 10
- Docker Desktop
- A Supabase project for hosted-database migration testing, when applicable

### Start

```bash
git clone https://github.com/fauzanbamba/hajjmed.dev.git
cd hajjmed.dev/production-platform
cp .env.example .env
# Replace every development secret before starting services.
docker compose up -d
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev:api
```

In a second terminal, run:

```bash
cd hajjmed.dev/production-platform
pnpm dev:mobile
```

The API defaults to `http://localhost:4000`; interactive API documentation is available at `/docs`. See [LOCAL-DEVELOPMENT.md](production-platform/LOCAL-DEVELOPMENT.md) for the complete development environment, and [SOURCE-CODE-MANIFEST.md](production-platform/SOURCE-CODE-MANIFEST.md) for the source inventory.

## Data protection and release boundary

Do not process real pilgrim health, passport, contact or clinical data in this environment. Before any live deployment, complete the documented clinical validation, DPIA, security testing, provider integrations, object-storage hardening, backup and recovery proof, and applicable Ghanaian and Saudi regulatory approvals.

The Supabase service-role key is backend-only and must never be exposed to web or mobile clients.

## License

This project is licensed under the [MIT License](LICENSE).
