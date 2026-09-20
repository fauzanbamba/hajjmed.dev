# Supabase workspace

Supabase PostgreSQL is the primary hosted database for HajjMed. The Fastify API uses Prisma as its ORM, while the existing domain data-access modules also use the server-side Supabase client where they have been migrated. Prisma is not a second production database.

## Connection model

- `DATABASE_URL`: Supabase pooler connection used by the API at runtime.
- `DIRECT_URL`: Supabase direct PostgreSQL connection used by Prisma migrations.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key. Never expose it to the web or mobile apps.

## Migration policy

- Add schema changes as ordered SQL migrations under `migrations/` when using Supabase CLI.
- Keep the Prisma migrations under `apps/api/prisma/migrations/` in sync with the deployed database when Prisma is used to deploy schema changes.
- Review foreign keys, unique constraints, indexes and row-level security before applying migrations.
- Do not commit `.env` files, database dumps or patient data.
- Do not create production tables manually from route code.

## API deployment

1. Set the Supabase runtime and direct connection strings in `.env.production`.
2. Run `pnpm --filter @hajjmed/api prisma generate`.
3. Run `pnpm --filter @hajjmed/api db:deploy`.
4. Start the API.

The production Docker Compose stack does not create a PostgreSQL container. Redis and object storage remain separate services.
