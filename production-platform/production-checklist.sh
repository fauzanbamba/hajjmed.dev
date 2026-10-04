#!/bin/bash
# ============================================================================
# HAJJMED PRODUCTION CHECKLIST
# ============================================================================
# Complete checklist for going into full production
# 
# Run this script to verify everything is ready
# Usage: ./production-checklist.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_count=0
pass_count=0
fail_count=0

# Helper functions
check_item() {
  ((check_count++))
  echo -n "[$check_count] $1... "
}

pass() {
  echo -e "${GREEN}✓${NC}"
  ((pass_count++))
}

fail() {
  echo -e "${RED}✗ $1${NC}"
  ((fail_count++))
}

warn() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

echo "============================================================================"
echo "HAJJMED PRODUCTION READINESS CHECKLIST"
echo "============================================================================"
echo ""

# ============================================================================
# 1. INFRASTRUCTURE CHECKS
# ============================================================================
echo "📋 INFRASTRUCTURE:"
echo ""

check_item "Docker installed"
if command -v docker &> /dev/null; then
  pass
else
  fail "Install Docker: https://docs.docker.com/install"
fi

check_item "Docker Compose installed"
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
  pass
else
  fail "Install Docker Compose"
fi

check_item "Git installed"
if command -v git &> /dev/null; then
  pass
else
  fail "Install Git"
fi

check_item "Domain registered"
if [ ! -z "$DOMAIN" ]; then
  pass
else
  warn "Set DOMAIN environment variable"
fi

# ============================================================================
# 2. APPLICATION CHECKS
# ============================================================================
echo ""
echo "🚀 APPLICATION:"
echo ""

check_item ".env.production exists"
if [ -f ".env.production" ]; then
  pass
else
  fail "Create .env.production from template"
fi

check_item "SUPABASE_URL configured"
if grep -q "SUPABASE_URL=https://" .env.production; then
  pass
else
  fail "Set SUPABASE_URL in .env.production"
fi

check_item "SUPABASE_ANON_KEY configured"
if grep -q "SUPABASE_ANON_KEY=" .env.production && ! grep -q "SUPABASE_ANON_KEY=\[" .env.production; then
  pass
else
  fail "Set SUPABASE_ANON_KEY in .env.production"
fi

check_item "JWT secrets configured"
if grep -q "JWT_ACCESS_SECRET=" .env.production && [ $(grep "JWT_ACCESS_SECRET=" .env.production | wc -c) -gt 30 ]; then
  pass
else
  fail "Generate and set JWT_ACCESS_SECRET in .env.production (openssl rand -base64 64)"
fi

check_item "APP_ORIGIN uses HTTPS"
if grep -q "APP_ORIGIN=https://" .env.production; then
  pass
else
  fail "Set APP_ORIGIN to HTTPS domain in .env.production"
fi

# ============================================================================
# 3. SERVICES CHECKS
# ============================================================================
echo ""
echo "🐳 SERVICES:"
echo ""

check_item "API Dockerfile exists"
if [ -f "apps/api/Dockerfile" ]; then
  pass
else
  fail "API Dockerfile not found"
fi

check_item "docker-compose.production.yml exists"
if [ -f "docker-compose.production.yml" ]; then
  pass
else
  fail "Create docker-compose.production.yml"
fi

check_item "Caddyfile exists"
if [ -f "Caddyfile" ]; then
  pass
else
  fail "Create Caddyfile for reverse proxy"
fi

# ============================================================================
# 4. GITHUB SETUP
# ============================================================================
echo ""
echo "🔧 GITHUB & CI/CD:"
echo ""

check_item ".github/workflows/docker-build.yml exists"
if [ -f ".github/workflows/docker-build.yml" ]; then
  pass
else
  fail "Create GitHub Actions workflow"
fi

check_item ".github/workflows/deploy.yml exists"
if [ -f ".github/workflows/deploy.yml" ]; then
  pass
else
  fail "Create GitHub Actions deployment workflow"
fi

check_item "GitHub repository initialized"
if [ -d ".git" ]; then
  pass
else
  warn "Initialize Git repository: git init"
fi

# ============================================================================
# 5. SECURITY CHECKS
# ============================================================================
echo ""
echo "🔒 SECURITY:"
echo ""

check_item "Secrets not in .env.production"
if ! grep -q "^SUPABASE_ANON_KEY=$" .env.production; then
  pass
else
  fail ".env.production contains placeholder values"
fi

check_item "Dockerfile doesn't expose secrets"
if ! grep -q "ENV.*SECRET" apps/api/Dockerfile; then
  pass
else
  fail "Remove hardcoded secrets from Dockerfile"
fi

check_item ".gitignore excludes .env files"
if grep -q "\.env" .gitignore 2>/dev/null; then
  pass
else
  warn "Add .env files to .gitignore"
fi

check_item "OTP_DEMO_MODE disabled"
if grep -q "OTP_DEMO_MODE=false" .env.production; then
  pass
else
  fail "Set OTP_DEMO_MODE=false for production"
fi

# ============================================================================
# 6. MONITORING SETUP
# ============================================================================
echo ""
echo "📊 MONITORING:"
echo ""

check_item "Prometheus config exists"
if [ -f "monitoring/prometheus.yml" ] || [ -f "prometheus.yml" ]; then
  pass
else
  warn "Create prometheus.yml for monitoring"
fi

check_item "Grafana dashboards included"
if [ -d "monitoring/grafana" ]; then
  pass
else
  warn "Add Grafana dashboard configurations"
fi

# ============================================================================
# 7. DOCUMENTATION
# ============================================================================
echo ""
echo "📝 DOCUMENTATION:"
echo ""

check_item "PRODUCTION-DEPLOYMENT.md exists"
if [ -f "PRODUCTION-DEPLOYMENT.md" ]; then
  pass
else
  fail "Create PRODUCTION-DEPLOYMENT.md"
fi

check_item "README.md exists"
if [ -f "README.md" ]; then
  pass
else
  fail "Create README.md"
fi

# ============================================================================
# 8. OPTIONAL BUT RECOMMENDED
# ============================================================================
echo ""
echo "💡 OPTIONAL (Recommended):"
echo ""

check_item "SENTRY_DSN configured for error tracking"
if grep -q "SENTRY_DSN=" .env.production; then
  pass
else
  warn "Add Sentry DSN for error tracking"
fi

check_item "Backup strategy documented"
if grep -q "backup" PRODUCTION-DEPLOYMENT.md 2>/dev/null; then
  pass
else
  warn "Document database backup strategy"
fi

check_item "SSL/TLS certificate plan"
if grep -q "Caddy\|certbot\|Let's Encrypt" Caddyfile 2>/dev/null; then
  pass
else
  warn "Plan SSL/TLS certificate setup"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "============================================================================"
echo "SUMMARY"
echo "============================================================================"
echo ""
echo -e "Total Checks: $check_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo -e "${YELLOW}Warnings: $(($check_count - $pass_count - $fail_count))${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ READY FOR PRODUCTION!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Update DNS to point to production server"
  echo "  2. Run: ./deploy-production.sh"
  echo "  3. Verify: curl https://yourdomain.com/health/ready"
  echo "  4. Monitor: https://monitoring.yourdomain.com"
  echo ""
  exit 0
else
  echo -e "${RED}✗ NOT READY FOR PRODUCTION${NC}"
  echo ""
  echo "Please fix the above issues before deploying."
  echo ""
  exit 1
fi
