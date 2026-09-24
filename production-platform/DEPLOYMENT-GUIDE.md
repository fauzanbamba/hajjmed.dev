
# HajjMed API - Registry Push & Deployment Guide

This guide covers pushing the Docker image to Docker Hub and deploying locally or to a remote server.

## Part 1: Docker Hub Registry Setup

### Prerequisites

- Docker installed and running
- Docker Hub account (amzan96)
- Docker Hub credentials

### Step 1: Authenticate with Docker Hub

```bash
docker login
# When prompted, enter:
# Username: amzan96
# Password: <your-docker-hub-token>
```

**To create a personal access token:**
1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Set token name (e.g., "HajjMed CI/CD")
4. Select "Read, Write, Delete" permissions
5. Copy the token and use it as your password

### Step 2: Build the Docker Image

```bash
cd production-platform

# Build the production image
docker build -f apps/api/Dockerfile -t hajjmed-api:latest .

# Verify the build
docker images | grep hajjmed
```

### Step 3: Push to Docker Hub

**Option A: Using the script (recommended)**

On **macOS/Linux**:
```bash
cd production-platform
bash scripts/push-to-docker-hub.sh latest
```

On **Windows PowerShell**:
```powershell
cd production-platform
.\scripts\push-to-docker-hub.ps1 -Tag latest
```

**Option B: Manual push**

```bash
docker tag hajjmed-api:latest amzan96/hajjmed-api:latest
docker push amzan96/hajjmed-api:latest
```

### Step 4: Verify the push

```bash
docker pull amzan96/hajjmed-api:latest
docker run --rm amzan96/hajjmed-api:latest node -v
```

View on Docker Hub: https://hub.docker.com/r/amzan96/hajjmed-api

---

## Part 2: Local Deployment with Docker Compose

### Prerequisites

- Docker and Docker Compose installed
- Valid `.env` file with configuration (see below)

### Step 1: Prepare environment file

```bash
cd production-platform

# Copy the example and edit with your actual values
cp .env.local.example .env

# Edit .env with your configuration
nano .env
# or use your editor of choice
```

**Critical values to replace:**
- `DATABASE_URL` - Your PostgreSQL/Supabase connection string
- `DIRECT_URL` - Direct database connection (required by Prisma)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase
- `JWT_ACCESS_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate: `openssl rand -base64 32`
- `OTP_PEPPER` - Generate: `openssl rand -hex 16`

### Step 2: Pull latest image from Docker Hub

```bash
docker pull amzan96/hajjmed-api:latest
```

### Step 3: Start services with docker-compose

```bash
# Start all services (API, Redis, MinIO, Mailpit)
docker compose up --pull always

# Or start in background
docker compose up -d --pull always

# View logs
docker compose logs -f api

# View all services
docker compose ps
```

### Step 4: Verify the deployment

```bash
# Check API health
curl http://localhost:4000/health/ready

# View API interactive documentation
open http://localhost:4000/docs
# or: curl http://localhost:4000/docs

# Check Redis
docker compose exec redis redis-cli ping

# Check MinIO console
open http://localhost:9001
# Username: hajjmed
# Password: replace-this-development-secret
```

### Step 5: Useful docker-compose commands

```bash
# Stop all services
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# View specific service logs
docker compose logs api
docker compose logs redis
docker compose logs minio

# Execute commands in running container
docker compose exec api node -v
docker compose exec redis redis-cli
docker compose exec minio mc ls minio

# Scale services (for testing)
docker compose up -d --scale api=3

# Restart a specific service
docker compose restart api
```

---

## Part 3: GitHub Actions CI/CD Setup

### Prerequisites

- GitHub repository with HajjMed code
- Docker Hub account (amzan96)

### Step 1: Add secrets to GitHub

Go to your GitHub repository:
1. Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:

```
DOCKER_HUB_USERNAME = amzan96
DOCKER_HUB_TOKEN = <your-docker-hub-token>
```

Optional (for remote deployments):
```
DEPLOY_HOST = your.server.com
DEPLOY_USER = deploy-user
DEPLOY_SSH_KEY = <your-ssh-private-key>
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/... (for notifications)
```

### Step 2: Push the workflow files

The workflow files are already in `.github/workflows/`:
- `docker-build.yml` - Builds and pushes to Docker Hub
- `deploy.yml` - Deploys to remote server

```bash
git add .github/workflows/
git commit -m "chore: add CI/CD workflows"
git push origin main
```

### Step 3: Monitor GitHub Actions

Go to your GitHub repository → Actions tab

The workflow will:
1. **On push to main/develop**: Build the image and push to Docker Hub
2. **On pull requests**: Build the image (no push) for validation
3. **On workflow completion**: Deploy to staging/production (if configured)

Logs are visible in the Actions tab.

---

## Part 4: Remote Server Deployment

### Prerequisites

- Remote server with Docker and Docker Compose installed
- SSH access to the server
- SSH key configured for GitHub

### Step 1: Prepare remote server

```bash
# SSH into your server
ssh deploy-user@your.server.com

# Create deployment directory
mkdir -p /opt/hajjmed-staging
mkdir -p /opt/hajjmed-production

# Clone the repository
cd /opt/hajjmed-staging
git clone https://github.com/your-org/hajjmed.git .
cd production-platform

# Create .env with production values
cp .env.local.example .env
nano .env  # Edit with production secrets
```

### Step 2: Configure SSH key for GitHub Actions

Generate SSH key on the server:
```bash
ssh-keygen -t ed25519 -f /home/deploy-user/.ssh/hajjmed-deploy -N ""
```

Add the public key to GitHub:
1. Go to repository → Settings → Deploy keys
2. Click "Add deploy key"
3. Paste contents of `~/.ssh/hajjmed-deploy.pub`
4. Check "Allow write access"

Add the private key to GitHub Secrets:
1. Go to repository → Settings → Secrets
2. Add secret `DEPLOY_SSH_KEY` with contents of `~/.ssh/hajjmed-deploy`

### Step 3: First deployment (manual)

```bash
cd /opt/hajjmed-staging/production-platform

# Pull latest code
git fetch origin
git checkout origin/main

# Pull latest image
docker pull amzan96/hajjmed-api:latest

# Start services
docker compose up -d --pull always

# Check status
docker compose ps
curl http://localhost:4000/health/ready
```

### Step 4: Automatic deployments

Once GitHub Actions is configured, pushes to main will automatically:
1. Build the Docker image
2. Push to Docker Hub
3. SSH to your server
4. Pull the latest code
5. Pull the latest Docker image
6. Restart containers with `docker compose up -d`
7. Verify health checks
8. Notify Slack (if configured)

Monitor deployments in the GitHub Actions tab.

---

## Troubleshooting

### Image won't build

```bash
# Check Docker daemon
docker ps

# Clear build cache
docker builder prune -a

# Build with verbose output
docker build -f apps/api/Dockerfile -t hajjmed-api:latest . --progress=plain
```

### Docker Compose fails to start

```bash
# Check logs
docker compose logs api

# Verify .env file
cat .env

# Check port availability
lsof -i :4000

# Rebuild without cache
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Health check fails

```bash
# Check container logs
docker compose logs api

# Verify API is responding
docker compose exec api curl http://localhost:4000/health/ready

# Check database connectivity
docker compose exec api psql -h ${DATABASE_HOST} -U postgres -c "SELECT 1"
```

### Push to Docker Hub fails

```bash
# Verify authentication
docker logout
docker login

# Check credentials
cat ~/.docker/config.json

# Verify image tag format
docker tag hajjmed-api:latest amzan96/hajjmed-api:latest
```

---

## Best Practices

✅ **Always use specific tags** (not just `latest`):
```bash
docker tag hajjmed-api:v1.0.0 amzan96/hajjmed-api:v1.0.0
docker push amzan96/hajjmed-api:v1.0.0
```

✅ **Use .env files for configuration** - never bake secrets into images

✅ **Test locally before pushing**:
```bash
docker run -p 4000:4000 amzan96/hajjmed-api:latest
curl http://localhost:4000/health/ready
```

✅ **Use semantic versioning** for production tags:
- v1.0.0 (releases)
- v1.0.0-rc.1 (release candidates)
- develop (development branch)

✅ **Monitor image size** - current: ~274MB (68MB compressed)
```bash
docker images | grep hajjmed
```

✅ **Rotate secrets regularly** - especially in production

✅ **Use database backups** before deployments

✅ **Set up alerts** for failed deployments

---

## Next Steps

1. ✅ Push image to Docker Hub
2. ✅ Test local deployment with `docker compose up`
3. ✅ Connect GitHub repository
4. ✅ Configure GitHub Secrets
5. ✅ Set up remote server
6. ✅ Test automatic deployments
7. ✅ Configure Slack notifications
8. ✅ Document runbooks for your team

---

## Support

For issues with Docker or Docker Compose:
- Docker Docs: https://docs.docker.com
- Docker Compose Docs: https://docs.docker.com/compose
- GitHub Actions: https://docs.github.com/en/actions

For HajjMed-specific issues:
- Check logs: `docker compose logs -f api`
- Review `.env` configuration
- Check database connectivity
- Review `/health/ready` endpoint response
