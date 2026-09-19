# Supabase workspace

This directory contains the reviewed Supabase project configuration and SQL migrations for HajjMed.

## Migration policy

- Add schema changes as ordered SQL migrations under `migrations/`.
- Review foreign keys, unique constraints, indexes and row-level security before applying migrations.
- Keep the backend service-role key server-only.
- Do not commit `.env` files, database dumps or patient data.
- Do not create production tables manually from route code.

The current API migration is staged and still uses Prisma as a controlled fallback. Convert and validate each bounded context before removing that fallback.
