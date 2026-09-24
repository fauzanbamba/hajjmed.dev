# HajjMed Docker Containerization Guide

## Overview

Your HajjMed project has been containerized with Docker best practices for development and production workflows.

## Generated Files

### 1. **Production Dockerfile** (`apps/api/Dockerfile`)
- **Multi-stage build**: Builder stage compiles TypeScript; runtime stage includes only production dependencies
- **Optimizations**:
  - Alpine base image for minimal footprint (~55MB base)
  - Layer caching: package definitions copied before source code
  - `tini` init process for proper signal handling
  - Healthcheck integrated at build time
  - Production-only dependencies via `pnpm install --prod`

### 2. **Development Dockerfile** (`apps/api/Dockerfile.dev`)
- Full dependency installation (includes dev dependencies)
- `tsx watch` for hot-reload support
- Mounts source directories for live file changes

### 3. **Production Compose** (`docker-compose.yml`)
- **Services**: API, Redis, MinIO, Mailpit
- **Features**:
  - Explicit networking (hajjmed-net bridge)
  - Resource limits and reservations for all services
  - Environment variable substitution via `.env` file
  - Service dependencies with healthchecks
  - Persistent volumes for data storage (Redis, MinIO)
  - Container naming for easy reference

### 4. **Development Compose Override** (`docker-compose.dev.yml`)
- Extends production compose with development settings
- Enables file watches via Docker Compose `develop.watch`
- Mounted source directories for hot reload
- Run with: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`

### 5. **Updated .dockerignore**
- Excludes unnecessary files from build context
- Prevents build cache invalidation
- Reduces image layer size

## Usage

### Production Build & Deploy
```bash
cd production-platform

# Build the API image
docker build -f apps/api/Dockerfile -t hajjmed-api:latest .

# Start all services
docker compose up -d

# View logs
docker compose logs -f api
```

### Development Workflow
```bash
cd production-platform

# Start with hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Watch for changes
docker compose logs -f api

# Stop services
docker compose down
```

### Environment Configuration
Create/update `.env`:
```bash
cp .env.example .env
# Edit .env and replace all development secrets before starting
```

**Critical for production:**
- Generate new `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- Set unique `OTP_PEPPER`
- Configure secure MinIO credentials
- Set `OTP_DEMO_MODE=false`
- Point `APP_ORIGIN` to production domain

## Compose Service Details

| Service | Port | Purpose | Data Volume |
|---------|------|---------|-------------|
| **api** | 4000 | Fastify backend | — |
| **redis** | 6379 | Session/cache store | `redis_data` |
| **minio** | 9000/9001 | S3-compatible object storage | `minio_data` |
| **mailpit** | 1025/8025 | SMTP + web UI for testing | — |

### Resource Limits
- **API**: 1 CPU / 512MB RAM
- **Redis**: 0.5 CPU / 256MB RAM
- **MinIO**: 0.5 CPU / 512MB RAM
- **Mailpit**: 0.25 CPU / 128MB RAM

## Build Verification

When TypeScript compilation issues are resolved:
```bash
docker build -f apps/api/Dockerfile -t hajjmed-api:latest .
docker run -p 4000:4000 hajjmed-api:latest
# API should be accessible at http://localhost:4000/docs
```

## Next Steps

1. **Fix TypeScript errors**: The source has compilation issues in config, db, and route files that must be resolved locally
2. **Update pnpm-lock.yaml**: Resolve dependency version mismatches for @supabase/supabase-js
3. **Test locally**: Run `docker compose up` after fixing errors
4. **Registry push**: `docker tag hajjmed-api:latest your-registry/hajjmed-api:latest && docker push ...`
5. **CI/CD setup**: Add GitHub Actions workflow for automated builds
6. **Healthcheck tuning**: Adjust API healthcheck endpoint as needed
