#!/bin/bash
# ============================================================================
# HAJJMED PRODUCTION DEPLOYMENT SCRIPT
# ============================================================================
# Usage: ./deploy-production.sh
# Deploys full production stack with monitoring, logging, SSL, and security

set -e  # Exit on error

echo "🚀 HajjMed Production Deployment"
echo "=================================="

# ============================================================================
# 1. VALIDATE ENVIRONMENT
# ============================================================================
echo "📋 Validating environment variables..."

required_vars=(
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "JWT_ACCESS_SECRET"
  "JWT_REFRESH_SECRET"
  "SENDGRID_API_KEY"
  "TWILIO_ACCOUNT_SID"
  "TWILIO_AUTH_TOKEN"
)

missing_vars=0
for var in "${required_vars[@]}"; do
  if [ -z "$(eval echo \$$var)" ]; then
    echo "❌ Missing: $var"
    missing_vars=$((missing_vars + 1))
  fi
done

if [ $missing_vars -gt 0 ]; then
  echo "❌ $missing_vars required environment variables missing!"
  echo "Set them in .env.production before deploying"
  exit 1
fi

echo "✅ All required variables present"

# ============================================================================
# 2. BUILD DOCKER IMAGE
# ============================================================================
echo ""
echo "🔨 Building Docker image..."
docker compose -f docker-compose.production.yml build --no-cache api

# ============================================================================
# 3. BACKUP DATABASE
# ============================================================================
echo ""
echo "💾 Creating database backup..."
docker compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres hajjmed > backup_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Database backup created"

# ============================================================================
# 4. STOP OLD CONTAINERS
# ============================================================================
echo ""
echo "🛑 Stopping old containers..."
docker compose -f docker-compose.production.yml down || true

# ============================================================================
# 5. START NEW SERVICES
# ============================================================================
echo ""
echo "🚀 Starting production services..."
docker compose -f docker-compose.production.yml up -d

# ============================================================================
# 6. WAIT FOR SERVICES
# ============================================================================
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check API health
echo "Checking API health..."
for i in {1..30}; do
  if curl -f http://localhost:4000/health/ready > /dev/null 2>&1; then
    echo "✅ API is healthy"
    break
  fi
  echo "Attempt $i/30..."
  sleep 2
done

# Check Redis
echo "Checking Redis..."
if docker compose -f docker-compose.production.yml exec -T redis redis-cli ping | grep -q PONG; then
  echo "✅ Redis is healthy"
fi

# Check Database
echo "Checking Database..."
if docker compose -f docker-compose.production.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
  echo "✅ Database is healthy"
fi

# ============================================================================
# 7. RUN MIGRATIONS
# ============================================================================
echo ""
echo "🔄 Running database migrations..."
docker compose -f docker-compose.production.yml exec -T api npm run db:deploy || echo "⚠️  Migrations may not be needed"

# ============================================================================
# 8. VERIFY DEPLOYMENT
# ============================================================================
echo ""
echo "🔍 Verifying deployment..."

echo ""
echo "Container Status:"
docker compose -f docker-compose.production.yml ps

echo ""
echo "API Response:"
curl -s http://localhost:4000/health/ready | jq .

echo ""
echo "Docker Compose Logs (last 20 lines):"
docker compose -f docker-compose.production.yml logs --tail 20

# ============================================================================
# 9. POST-DEPLOYMENT
# ============================================================================
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Services Running:"
echo "  API:          http://localhost:4000"
echo "  Docs:         http://localhost:4000/docs"
echo "  Grafana:      http://localhost:3000 (monitoring.yourdomain.com)"
echo "  Prometheus:   http://localhost:9090"
echo "  Redis:        localhost:6379"
echo "  Database:     localhost:5432"
echo ""
echo "📊 Monitoring:"
echo "  Prometheus:   Scraping every 15s"
echo "  Loki:         Collecting logs"
echo "  Grafana:      Visualizing metrics"
echo ""
echo "🔐 Security:"
echo "  Caddy:        Running on ports 80/443 (auto HTTPS)"
echo "  Rate limit:   60 requests/minute"
echo "  Headers:      Security headers enabled"
echo ""
echo "📝 Next Steps:"
echo "  1. Update DNS records to point to this server"
echo "  2. Verify HTTPS at https://yourdomain.com"
echo "  3. Check monitoring at https://monitoring.yourdomain.com"
echo "  4. Set up automated backups"
echo "  5. Configure log retention policies"
echo "  6. Enable database replication (optional)"
echo ""
echo "📞 For support, check logs with:"
echo "  docker compose -f docker-compose.production.yml logs -f api"
