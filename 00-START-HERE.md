# HajjMed2027Dr.Tanko handover package

Prepared: 4 September 2026

This folder contains the full source code developed to date and the accompanying software-development-lifecycle documentation.

## Start here

1. Read `source/production-platform/SOURCE-CODE-MANIFEST.md`.
2. Read `source/production-platform/docs/00-DOCUMENT-CONTROL.md`.
3. Read `source/production-platform/docs/09-HANDOVER-AND-CONTINUATION.md`.
4. Follow `source/production-platform/LOCAL-DEVELOPMENT.md` for local setup.

## Contents

- `source/web-pwa`: responsive browser prototype and PWA source.
- `source/production-platform/apps/api`: TypeScript/Fastify/Prisma backend.
- `source/production-platform/apps/mobile`: Expo/React Native mobile app.
- `source/production-platform/packages/contracts`: shared TypeScript contracts.
- `source/production-platform/docs`: full SDLC and technical documentation.
- `reference-documents`: earlier production foundation document.
- `TEST-REPORT.md`: verification performed for this handover.

## Security

No `.env`, `node_modules`, local database, cache or real medical dataset is included. Create a new `.env` from `.env.example` and use newly generated secrets. Never use the example credentials in production.

## Readiness

This is a development handover package. It is not yet authorization to deploy with real medical data. The remaining clinical validation, security assurance, integrations, DPIA and regulatory release gates are documented in the source package.
