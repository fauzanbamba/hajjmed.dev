# HajjMed 2027 source-code manifest

Version: 0.2 development foundation  
Prepared: 4 September 2026  
Product owner: Dr. Abdul Samed Sulemana, sole proprietor of NADMED Consult  
Clinical authority represented in the workflow: Medical Directorate, Pilgrims Affairs Office Ghana

## Source locations

| Component | Location | Technology | Current status |
|---|---|---|---|
| Responsive web/PWA | `../hajjmed-emr` | HTML, CSS, JavaScript, service worker | Interactive UX prototype; browser-local demonstration data |
| Production API | `apps/api` | TypeScript, Fastify, Prisma | Runnable backend foundation with authorization, audit and business rules |
| Mobile application | `apps/mobile` | Expo, React Native, Expo Router | Runnable mobile foundation; API-connected authentication shell |
| Shared contracts | `packages/contracts` | TypeScript | Shared roles, regions and appointment rules |
| Database | `apps/api/prisma` | PostgreSQL and Prisma | Schema, seed and versioned migrations |
| Local infrastructure | `docker-compose.yml` | PostgreSQL, Redis, MinIO, Mailpit | Development only |
| Documentation | `docs` | Markdown | SDLC and technical handover set |

## Important boundary

The repository contains the full source currently developed. It is a production-oriented foundation, not a completed or certified production EMR. The static web prototype does not yet persist its demonstration workflows through the API. SMS, email, identity verification, terminology, object storage, FHIR exchange, monitoring and production hosting require selected providers and integration work.

Do not process real patient data until the release gates in `docs/06-TEST-VALIDATION-AND-RELEASE.md` are passed.

## Files that must not be handed to another team

- `.env` files containing local secrets
- `node_modules`, build output and caches
- portable PostgreSQL data directories
- real exports, uploaded clinical documents or test patient data

Use `.env.example`, the lockfile, migrations and source files to reproduce the environment.
