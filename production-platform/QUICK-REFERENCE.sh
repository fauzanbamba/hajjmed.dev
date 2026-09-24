#!/bin/bash
# Quick Reference: Common Docker & Deployment Commands
# =======================================================
# Copy these commands for fast reference

# ─────────────────────────────────────────────────────────
# DOCKER HUB PUSH
# ─────────────────────────────────────────────────────────

# Login to Docker Hub
docker login

# Build the image
docker build -f apps/api/Dockerfile -t hajjmed-api:latest .

# Tag the image
docker tag hajjmed-api:latest amzan96/hajjmed-api:latest

# Push to Docker Hub
docker push amzan96/hajjmed-api:latest

# ─────────────────────────────────────────────────────────
# LOCAL DEPLOYMENT (Docker Compose)
# ─────────────────────────────────────────────────────────

# Setup
cd production-platform
cp .env.local.example .env
# Edit .env with your values: nano .env

# Pull latest image
docker pull amzan96/hajjmed-api:latest

# Start all services
docker compose up -d --pull always

# View logs
docker compose logs -f api

# Stop services
docker compose down

# ─────────────────────────────────────────────────────────
# VERIFICATION
# ─────────────────────────────────────────────────────────

# Check API health
curl http://localhost:4000/health/ready

# View API docs
curl http://localhost:4000/docs

# Check all services
docker compose ps

# View service logs
docker compose logs redis
docker compose logs minio
docker compose logs mailpit

# ─────────────────────────────────────────────────────────
# DEBUGGING
# ─────────────────────────────────────────────────────────

# List all images
docker images

# List running containers
docker ps

# Inspect a container
docker inspect hajjmed-api

# Execute command in container
docker compose exec api sh

# View container environment
docker compose exec api env

# Check disk usage
docker system df

# Clean up unused images/volumes
docker system prune -a --volumes

# ─────────────────────────────────────────────────────────
# IMAGE MANAGEMENT
# ─────────────────────────────────────────────────────────

# Tag with version
docker tag hajjmed-api:latest amzan96/hajjmed-api:v1.0.0
docker push amzan96/hajjmed-api:v1.0.0

# List all tags
docker tag hajjmed-api:latest amzan96/hajjmed-api:develop
docker push amzan96/hajjmed-api:develop

# Remove local image
docker rmi hajjmed-api:latest
docker rmi amzan96/hajjmed-api:latest

# ─────────────────────────────────────────────────────────
# GITHUB ACTIONS
# ─────────────────────────────────────────────────────────

# Push code to trigger workflows
git add .
git commit -m "chore: update configuration"
git push origin main

# View workflow status
# → GitHub repo → Actions tab

# ─────────────────────────────────────────────────────────
# REMOTE SERVER DEPLOYMENT
# ─────────────────────────────────────────────────────────

# SSH to server
ssh deploy-user@your.server.com

# Deploy manually
cd /opt/hajjmed-staging/production-platform
git pull origin main
docker compose pull
docker compose up -d

# Check status
docker compose ps
curl http://localhost:4000/health/ready

# View logs
docker compose logs -f api

# ─────────────────────────────────────────────────────────
# PERFORMANCE MONITORING
# ─────────────────────────────────────────────────────────

# View container stats
docker stats

# Check container resource limits
docker inspect hajjmed-api | grep -A 10 "HostConfig"

# View network activity
docker stats --no-stream --format "table {{.Container}}\t{{.NetI}}\t{{.NetO}}"

# ─────────────────────────────────────────────────────────
# BACKUP & RECOVERY
# ─────────────────────────────────────────────────────────

# Backup database before deployment
docker compose exec -T postgres pg_dump -U postgres > backup.sql

# Backup volumes
docker run --rm -v hajjmed_redis_data:/data -v $(pwd):/backup busybox tar czf /backup/redis-backup.tar.gz /data

# Restore from backup
docker compose exec -T postgres psql -U postgres < backup.sql
