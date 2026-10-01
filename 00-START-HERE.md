# HajjMed2027Dr.Tanko handover package

Prepared: 4 September 2026

This folder contains handover and reference materials. The active application source is in `production-platform/` and uses Supabase PostgreSQL. `source/production-platform/` is an older Prisma-based snapshot, not the current build or deployment target.

## Start here

1. Read `README.md`.
2. Read `production-platform/SOURCE-CODE-MANIFEST.md`.
3. Read `production-platform/docs/00-DOCUMENT-CONTROL.md`.
4. Follow `production-platform/LOCAL-DEVELOPMENT.md` for local setup.

## Contents

- `web-pwa`: responsive browser prototype and PWA source.
- `production-platform/apps/api`: TypeScript/Fastify API using Supabase.
- `production-platform/apps/mobile`: Expo/React Native mobile app.
- `production-platform/packages/contracts`: shared TypeScript contracts.
- `production-platform/docs`: current SDLC and technical documentation.
- `source/production-platform`: older Prisma snapshot and unique historical handover materials.
- `reference-documents`: earlier production foundation document.
- `02-TEST-REPORT.md`: historical verification report; rerun the current workspace checks before relying on it.

## Security

Local `.env*` files may exist in a developer's working copy and are not handover materials. Never copy or commit them; use `.env.example` to configure a separate environment with newly generated secrets. Treat any existing local values as potentially sensitive and rotate them if they have been shared. Never use example credentials in production.

## Readiness

This is a development handover package. It is not authorization to deploy with real medical data. The remaining clinical validation, security assurance, integrations, DPIA and regulatory release gates are documented in `production-platform/docs/`.
