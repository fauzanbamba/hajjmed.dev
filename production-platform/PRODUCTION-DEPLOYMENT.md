# ============================================================================
# HAJJMED PRODUCTION DEPLOYMENT GUIDE
# ============================================================================
# Complete guide to deploying all services: API, Monitoring, Mobile, CI/CD

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Deploy (10 minutes)](#quick-deploy)
3. [Full Production Setup](#full-production-setup)
4. [Mobile App Deployment](#mobile-app-deployment)
5. [CI/CD Configuration](#cicd-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Hardening](#security-hardening)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need
- [ ] Domain name (e.g., yourdomain.com)
- [ ] Production server (AWS, DigitalOcean, Linode, Render, Railway, Fly.io)
- [ ] Docker & Docker Compose installed on server
- [ ] GitHub account with repository
- [ ] Supabase project (cloud or self-hosted)
- [ ] Sendgrid account (email service)
- [ ] Twilio account (SMS service)
- [ ] SSL certificate (auto-generated with Caddy)

### Costs (Monthly Estimates)
- Server: $5-50 (depending on provider)
- Supabase: $25-100 (depending on usage)
- Email service: $10-50 (Sendgrid)
- SMS service: $0.01-0.10 per message (Twilio)
- Monitoring: Free (Prometheus/Grafana)
- Total: ~$50-250/month

---

## Quick Deploy (10 minutes)

### Step 1: Prepare Server

```bash
# SSH into server
ssh root@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker compose --version
```

### Step 2: Clone Repository

```bash
git clone https://github.com/yourusername/HajjMed.git
cd HajjMed/production-platform
```

### Step 3: Configure Environment

```bash
# Copy production config template
cp .env.production.example .env.production

# Edit with real values
nano .env.production

# Required values:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - JWT_ACCESS_SECRET (generate: openssl rand -base64 64)
# - JWT_REFRESH_SECRET (generate: openssl rand -base64 64)
# - SENDGRID_API_KEY
# - TWILIO_ACCOUNT_SID
# - TWILIO_AUTH_TOKEN
# - Domain name (yourdomain.com)
```

### Step 4: Generate Secrets

```bash
# Generate JWT secrets (do this 2 times)
openssl rand -base64 64

# Copy output into .env.production for:
# JWT_ACCESS_SECRET=<paste-here>
# JWT_REFRESH_SECRET=<paste-here>
```

### Step 5: Deploy

```bash
# Make script executable
chmod +x deploy-production.sh

# Run deployment
./deploy-production.sh

# Or manually:
docker compose -f docker-compose.production.yml up -d --build
```

### Step 6: Verify

```bash
# Check all services
docker compose -f docker-compose.production.yml ps

# Test API
curl http://localhost:4000/health/ready

# View logs
docker compose -f docker-compose.production.yml logs -f api
```

---

## Full Production Setup

### 1. Domain & DNS

**Register Domain:**
- Use: Namecheap, GoDaddy, Route53, Google Domains
- Cost: $5-15/year

**Update DNS Records:**
```
Type    | Name         | Value
--------|--------------|-------------------
A       | yourdomain   | YOUR_SERVER_IP
A       | www          | YOUR_SERVER_IP
A       | api          | YOUR_SERVER_IP
A       | monitoring   | YOUR_SERVER_IP
MX      | @            | your-mail-server (for email)
TXT     | @            | v=spf1 include:sendgrid.net ~all (for Sendgrid)
```

**Update Caddyfile with your domain:**
```bash
sed -i 's/yourdomain.com/your-actual-domain.com/g' Caddyfile
```

### 2. SSL/HTTPS (Automatic with Caddy)

Caddy automatically generates and renews SSL certificates with Let's Encrypt. No manual setup needed!

**Verify HTTPS:**
```bash
curl https://yourdomain.com/health/ready
# Should return: {"status":"ready",...}
```

### 3. Production Database

**Option A: Supabase Cloud (Recommended)**
- Already configured
- Automatic backups
- Managed replication
- No infrastructure to maintain

**Option B: Self-hosted PostgreSQL**
- Already in docker-compose.production.yml
- Manual backups needed
- Full control

**Setup Backups:**
```bash
# Create daily backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
docker compose -f /app/production-platform/docker-compose.production.yml exec -T postgres pg_dump -U postgres hajjmed > /backups/db_$(date +%Y%m%d_%H%M%S).sql
EOF

chmod +x /usr/local/bin/backup-db.sh

# Schedule daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -
```

### 4. Email Service (Sendgrid)

**Setup Sendgrid:**
1. Sign up at https://sendgrid.com
2. Create API key: Settings → API Keys → Create API Key
3. Add to .env.production:
   ```
   SENDGRID_API_KEY=SG.your-key-here
   EMAIL_PROVIDER=sendgrid
   ```

**Verify:**
```bash
# API should send test email on next request
curl -X POST http://yourdomain.com/api/v1/auth/email-verification
```

### 5. SMS Service (Twilio)

**Setup Twilio:**
1. Sign up at https://twilio.com
2. Get Account SID & Auth Token from dashboard
3. Get phone number (e.g., +1234567890)
4. Add to .env.production:
   ```
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Verify:**
```bash
# API should send test SMS on next request
curl -X POST http://yourdomain.com/api/v1/auth/sms-verification \
  -d "phone=+1234567890"
```

### 6. Monitoring Stack

Already included in docker-compose.production.yml:

**Access Monitoring:**
- Grafana (Dashboard): https://monitoring.yourdomain.com
- Prometheus (Metrics): http://yourdomain.com:9090
- Loki (Logs): Integrated in Grafana

**Import Grafana Dashboards:**
1. Open Grafana: https://monitoring.yourdomain.com
2. Login with credentials from .env.production
3. Add Prometheus datasource: http://prometheus:9090
4. Import dashboards from Grafana marketplace (search "docker", "node")

**Setup Alerts:**
1. Create alert in Grafana for:
   - API down (health check fails)
   - High memory usage (>80%)
   - High CPU usage (>80%)
   - Database connection errors

### 7. Object Storage (S3)

For production file uploads, configure AWS S3:

**Create AWS S3 Bucket:**
1. AWS Console → S3 → Create Bucket
2. Enable versioning & public access blocking
3. Create IAM user with S3 access
4. Generate access key & secret
5. Add to .env.production:
   ```
   OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com
   OBJECT_STORAGE_REGION=us-east-1
   OBJECT_STORAGE_ACCESS_KEY=AKIA...
   OBJECT_STORAGE_SECRET_KEY=...
   OBJECT_STORAGE_BUCKET=hajjmed-prod
   ```

---

## Mobile App Deployment

### Build for iOS (Apple App Store)

**Prerequisites:**
- Apple Developer Account ($99/year)
- MacOS machine
- Xcode 15+
- Provisioning profiles & certificates

**Build:**
```bash
cd apps/mobile
eas build --platform ios --auto-submit

# Or locally:
eas build --platform ios
```

**Submit:**
1. Xcode → Organizer → Validate App
2. Submit to App Store
3. Fill out metadata, screenshots, description
4. Submit for review (takes 1-3 days)

### Build for Android (Google Play Store)

**Prerequisites:**
- Google Play Developer Account ($25 one-time)
- Android build certificate

**Build:**
```bash
cd apps/mobile
eas build --platform android --auto-submit

# Or locally:
eas build --platform android
```

**Submit:**
1. Google Play Console → Create Release
2. Upload APK/AAB
3. Fill out store listing (same content as iOS)
4. Submit for review (usually 2-4 hours)

### Update API URL in Mobile App

Update in `apps/mobile/.env.production`:
```
EXPO_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

Rebuild and resubmit to stores.

---

## CI/CD Configuration

### GitHub Actions Workflow

Already set up in `.github/workflows/`. 

**Configure GitHub Secrets:**
```
DOCKER_HUB_USERNAME=amzan96
DOCKER_HUB_TOKEN=<your-token>

# Production deployment
DEPLOY_HOST=your-server-ip
DEPLOY_USER=root
DEPLOY_KEY=<private-ssh-key>
DEPLOY_PATH=/app/HajjMed

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

**Automatic Workflow:**
1. Push to `main` branch
2. GitHub Actions builds Docker image
3. Runs tests
4. Pushes to Docker Hub
5. Deploys to production server via SSH
6. Sends Slack notification

**View Workflow:**
```
https://github.com/yourusername/HajjMed/actions
```

---

## Monitoring & Logging

### Application Metrics

**Prometheus scrapes every 15 seconds:**
- API response times
- Error rates
- Request count
- Memory usage
- CPU usage
- Redis connections
- Database connections

**View Metrics:**
- Prometheus UI: http://yourdomain.com:9090
- Grafana: https://monitoring.yourdomain.com

### Application Logs

**Loki aggregates logs from:**
- API (stdout)
- Redis
- Database
- Nginx/Caddy

**Query logs in Grafana:**
```
{job="docker"} | json | level="error"
```

### Error Tracking (Optional)

Integrate Sentry for production error tracking:

```bash
# 1. Sign up at https://sentry.io
# 2. Create project (Node.js)
# 3. Get DSN
# 4. Add to .env.production:
SENTRY_DSN=https://xxx@sentry.io/project-id

# 5. Errors automatically reported
```

---

## Security Hardening

### Network Security

```bash
# Enable firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

### Database Security

```bash
# 1. Create strong database password
openssl rand -base64 32

# 2. Set in .env.production
DB_PASSWORD=<strong-password>

# 3. Limit database access
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -c "GRANT CONNECT ON DATABASE hajjmed TO postgres;"

# 4. Enable SSL for DB connections (already in .env.production)
```

### API Security

**Already configured in docker-compose.yml:**
- CORS headers
- Rate limiting (60 req/min)
- Helmet security headers
- JWT authentication
- HTTPS redirect
- HSTS

**Additional hardening:**
```bash
# Enable fail2ban to block brute force
sudo apt-get install fail2ban
sudo systemctl enable fail2ban

# Monitor failed requests
docker compose -f docker-compose.production.yml exec caddy caddy log ... | grep "status=401"
```

### Secret Management

**NEVER commit secrets to Git!**

Use GitHub Secrets instead:
1. Go to repository Settings → Secrets
2. Add all environment variables
3. Reference in CI/CD workflow: `${{ secrets.VAR_NAME }}`

### Regular Maintenance

```bash
# Daily: Check logs
docker compose -f docker-compose.production.yml logs --since 24h | grep error

# Weekly: Verify backups
ls -lh /backups/

# Monthly: Update packages
docker pull node:22-alpine
docker pull postgres:16-alpine
docker pull redis:7-alpine

# Quarterly: Rotate secrets
# 1. Generate new JWT secrets
# 2. Update in GitHub Secrets
# 3. Redeploy
```

---

## Troubleshooting

### API not responding

```bash
# 1. Check if container is running
docker ps | grep hajjmed-api

# 2. View logs
docker logs hajjmed-api --tail 50

# 3. Test health endpoint
curl http://localhost:4000/health/ready

# 4. Check container resource usage
docker stats hajjmed-api

# 5. Restart container
docker restart hajjmed-api
```

### Database connection errors

```bash
# 1. Verify database is running
docker ps | grep postgres

# 2. Test connection
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d hajjmed -c "SELECT 1;"

# 3. Check environment variables
docker exec hajjmed-api env | grep DATABASE_URL
```

### SSL certificate issues

```bash
# 1. Check Caddy logs
docker logs hajjmed-caddy

# 2. Verify domain points to server
nslookup yourdomain.com

# 3. Force certificate renewal
docker compose -f docker-compose.production.yml exec caddy caddy renew --force

# 4. Check certificate expiry
openssl s_client -connect yourdomain.com:443 -showcerts | grep -A 2 "Issuer\|Validity"
```

### High memory usage

```bash
# 1. Check which service uses memory
docker stats

# 2. Increase Docker memory limit
# Edit docker-compose.production.yml: deploy.resources.limits.memory

# 3. Restart service
docker restart hajjmed-api

# 4. Review logs for memory leaks
docker logs hajjmed-api --tail 100 | grep -i memory
```

### Performance issues

```bash
# 1. Check API response times
docker logs hajjmed-api --tail 100 | grep responseTime

# 2. Monitor database queries
docker compose -f docker-compose.production.yml exec postgres pg_stat_statements

# 3. Check Redis hit rate
docker compose -f docker-compose.production.yml exec redis redis-cli INFO stats

# 4. Review Grafana dashboards for bottlenecks
```

---

## Support & Resources

- **API Docs:** https://yourdomain.com/docs
- **Grafana Dashboards:** https://monitoring.yourdomain.com
- **Prometheus:** http://yourdomain.com:9090
- **Docker Logs:** `docker compose -f docker-compose.production.yml logs -f`
- **System Logs:** `journalctl -u docker.service -n 50`

## Next Steps

1. ✅ Deploy API to production
2. ✅ Configure domain & SSL
3. ✅ Set up monitoring
4. ✅ Build & submit mobile apps
5. ✅ Configure CI/CD
6. ✅ Set up backups & monitoring
7. ✅ Launch! 🚀
