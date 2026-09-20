# HajjMed Supabase API Migration

The API no longer uses `@prisma/client` for runtime database access. Database operations are routed through the Supabase service-role client using `src/lib/db.ts`.

## Runtime

- Supabase PostgreSQL is the primary database.
- Prisma Client is removed from API dependencies.
- Prisma schema is retained only as a historical/reference model and should not be used at runtime.
- Supabase migrations live under `supabase/migrations/`.

## Important transaction note

Supabase JS/PostgREST does not expose an application transaction API equivalent to Prisma `$transaction`. The compatibility layer executes ordinary operations through Supabase. Operations that require strict atomicity must be implemented as PostgreSQL RPC functions. Practitioner registration has already been converted to `create_practitioner()`.

Before production go-live, convert the remaining multi-step critical workflows (appointment batch booking, pharmacy supply, audit-chain writes) to dedicated PostgreSQL functions and test them under concurrency.
