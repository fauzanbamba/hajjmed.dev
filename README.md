# HajjMed Ghana

HajjMed is a production-oriented medical screening and healthcare coordination platform for Ghanaian pilgrims preparing for Hajj 2027.

The platform provides secure workflows for pilgrim registration, appointment scheduling, clinical screening, immunization, encounters, care plans, medical fitness certification, pharmacy operations, communications and administrative oversight.

> This project is a development foundation. It is not yet approved for live medical data or regulatory production deployment.

## Repository

GitHub: https://github.com/fauzanbamba/hajjmed.dev

## Architecture

- `apps/api` - Fastify and TypeScript backend API
- `apps/mobile` - Expo and React Native mobile application
- `packages/contracts` - Shared TypeScript contracts and business types
- `prisma` - Database schema, migrations and seed data
- `docs` - Architecture, security, database and deployment documentation
- `web-pwa` - Browser-based user experience prototype
- `reference-documents` - Product and foundation reference material

## Technology Stack

- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Supabase
- Redis
- MinIO-compatible object storage
- Expo and React Native
- Zod
- Docker Compose
- pnpm

## Core Features

- Pilgrim registration and identity management
- Organization and agent access control
- Role-based authentication and OTP verification
- Trusted-device authentication
- Appointment availability and capacity management
- Protected appointment slots
- Clinical screening workflows
- Regulatory hard-red screening controls
- Immunization records
- Clinical encounters
- Care plans
- Medical fitness certificate authentication
- Pharmacy inventory and dispensing workflows
- Secure communications
- Notification workflows
- Audit logging
- QR-based pilgrim access
- Mobile application support

## Supabase Migration

The backend is being migrated incrementally to Supabase.

The current migration pattern is:

1. Supabase data access is attempted first.
2. Existing Prisma access remains as a controlled fallback.
3. Business rules and authorization remain in the API layer.
4. Each domain is migrated independently.
5. Prisma fallback will be removed only after validation, reconciliation and rollback testing.

Migration areas include:

- Authentication and sessions
- Pilgrim records
- Appointments
- Clinical screening
- Immunizations
- Encounters
- Care plans
- Communications
- Pharmacy
- Notifications
- Administrative reporting
- Audit events

The Supabase service-role key must only be used by the backend API. It must never be exposed to web or mobile clients.

## Local Development

### Requirements

- Node.js LTS
- pnpm
- Docker Desktop
- PostgreSQL, Redis and MinIO through Docker Compose
- Supabase project for hosted database testing

### Installation

```bash
git clone https://github.com/fauzanbamba/hajjmed.dev.git
cd hajjmed.dev/production-platform
pnpm install
