# HajjMed Supabase API Cutover

HajjMed API runtime database access is now Supabase-first. The Fastify API uses `@supabase/supabase-js` with the server-side service-role key and a local Supabase data-access adapter. Prisma Client is no longer a runtime dependency.

## Environment

Required production database settings:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The API does not require `DATABASE_URL` or `DIRECT_URL` at runtime.

## Database deployment

Supabase migrations are stored in:

```text
supabase/migrations/
```

From a machine with the Supabase CLI authenticated and linked to the project:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## API startup

The production container only starts the API. Database migrations are deliberately not run during every container boot.

```bash
pnpm --filter @hajjmed/api build
node apps/api/dist/src/server.js
```

## Runtime data layer

Application reads and writes flow through:

```text
Fastify route/service
        |
        v
apps/api/src/lib/db.ts
        |
        v
Supabase service-role client
        |
        v
Supabase PostgreSQL
```

## Transactions

Supabase JS/PostgREST does not expose Prisma-style application transactions. Critical multi-step workflows therefore need PostgreSQL RPC functions. Practitioner registration is implemented as `create_practitioner()`.

The remaining workflows that contain multiple dependent writes should be converted to dedicated RPCs before production concurrency testing, especially:

- batch appointment booking
- pharmacy requisition supply
- audit-chain writes

Do not treat the compatibility `$transaction` wrapper in `db.ts` as a true PostgreSQL transaction.
