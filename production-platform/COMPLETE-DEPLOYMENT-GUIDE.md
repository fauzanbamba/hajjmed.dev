# ============================================================================
# HAJJMED - COMPLETE PRODUCTION DEPLOYMENT GUIDE
# ============================================================================
# Everything You Need to Deploy HajjMed to Production
# 
# By the end of this guide, you'll have:
# ✅ API running on production server
# ✅ Domain + HTTPS certificate
# ✅ Monitoring & logging
# ✅ Mobile apps in App Stores
# ✅ Automated CI/CD pipeline

## SECTION 1: QUICK START (1-2 hours)

### What You'll Need
- Server: AWS, DigitalOcean, Render, Railway, or Fly.io
- Domain: Any registrar (Namecheap, GoDaddy, Route53)
- GitHub account with your code
- Production Supabase project
- Email provider account (Sendgrid)
- SMS provider account (Twilio)

### Timeline
- [ ] 15 min: Register domain
- [ ] 30 min: Set up server
- [ ] 45 min: Deploy API
- [ ] 30 min: Configure monitoring
- [ ] 15 min: Test everything

---

## SECTION 2: STEP-BY-STEP DEPLOYMENT

### STEP 1: Register Domain (15 minutes)

**Registrars:**
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Route53 (AWS): https://aws.amazon.com/route53
- Google Domains: https://domains.google

**Cost:** $5-15/year

**Process:**
1. Search for domain
2. Add to cart
3. Complete purchase
4. Go to DNS settings
5. Note the nameservers (you'll need these)

---

### STEP 2: Provision Production Server (30 minutes)

**Pick ONE provider:**

#### EASIEST: Render.com
```
1. Go to https://render.com
2. Sign up with GitHub
3. Create new "Web Service"
4. Connect your GitHub repository
5. Configure environment variables
6. Deploy (automatic from GitHub)
Cost: $20-100/month
```

#### EASIEST: Railway.app
```
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Add environment variables
5. Connect domain
Cost: $15-50/month pay-as-you-go
```

#### MOST CONTROL: DigitalOcean Droplet
```
1. Create account at https://digitalocean.com
2. Create Droplet:
   - Image: Ubuntu 22.04
   - Size: $6-12/month (2GB RAM, 1 vCPU)
   - Region: Closest to users
3. SSH into server
4. Run deployment script (see below)
Cost: $6-12/month
```

#### MOST CONTROL: AWS EC2
```
1. Create account at https://aws.amazon.com
2. Launch EC2 instance:
   - AMI: Ubuntu 22.04
   - Type: t3.small (1GB RAM, 2 vCPU)
   - Storage: 20GB
   - Security group: Allow 22, 80, 443
3. SSH into server
4. Run deployment script
Cost: $10-30/month
```

#### TRADITIONAL: Linode
```
1. Create account at https://linode.com
2. Create Linode:
   - Image: Ubuntu 22.04
   - Type: Nanode 1GB ($5/month)
3. SSH and deploy
Cost: $5-25/month
```

---

### STEP 3: Deploy API to Server (45 minutes)

#### IF USING RENDER OR RAILWAY:
```
1. Connect GitHub repository
2. Add these environment variables:
   - NODE_ENV=production
   - SUPABASE_URL=your-url
   - SUPABASE_ANON_KEY=your-key
   - JWT_ACCESS_SECRET=your-secret
   - ... (all from .env.production)
3. Click Deploy
4. Wait 5-10 minutes
5. Your API is live!
Cost: Already included
```

#### IF USING DIGITALOCEAN/AWS/LINODE:
```bash
# 1. SSH into server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh

# 3. Clone your repository
git clone https://github.com/yourusername/HajjMed.git
cd HajjMed/production-platform

# 4. Create production environment file
nano .env.production
# (Add all values from checklist)

# 5. Deploy
chmod +x deploy-production.sh
./deploy-production.sh

# 6. Verify
curl http://localhost:4000/health/ready
```

---

### STEP 4: Setup Domain & SSL (30 minutes)

#### IF USING RENDER/RAILWAY:
```
1. Go to project settings
2. Add custom domain
3. Copy DNS records
4. Add to domain registrar
5. Wait 5-10 minutes
6. HTTPS automatically enabled
```

#### IF USING VPS:
```bash
# Caddy automatically handles SSL (included in docker-compose.production.yml)

# Update Caddyfile with your domain:
sed -i 's/yourdomain.com/your-actual-domain.com/g' Caddyfile

# Update DNS records at your registrar:
Type | Name | Value
-----|------|-------
A    | @    | YOUR_SERVER_IP
A    | www  | YOUR_SERVER_IP
A    | api  | YOUR_SERVER_IP

# Restart services
docker compose -f docker-compose.production.yml restart caddy

# Verify HTTPS
curl https://yourdomain.com/health/ready
```

---

### STEP 5: Verify Production (15 minutes)

**Test API:**
```bash
# Health check
curl https://yourdomain.com/health/ready

# API documentation
curl https://yourdomain.com/docs

# Expected responses:
# {"status":"ready","service":"hajjmed-api","database":"supabase"}
# 200 OK from docs endpoint
```

**Check monitoring:**
```
- Prometheus: http://yourdomain.com:9090
- Grafana: https://monitoring.yourdomain.com
- Logs: docker logs hajjmed-api
```

---

## SECTION 3: CONFIGURE SERVICES (1-2 hours)

### A. Email Service (Sendgrid)

**Setup:**
```bash
# 1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
# 2. Dashboard → Settings → API Keys
# 3. Create API Key
# 4. Add to production environment:
export SENDGRID_API_KEY=SG.your-key-here

# 5. Restart API
docker restart hajjmed-api

# 6. Test:
curl -X POST https://yourdomain.com/api/v1/auth/email-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Cost:** Free (100/day) or $14.95/month (100k/month)

### B. SMS Service (Twilio)

**Setup:**
```bash
# 1. Sign up at https://twilio.com (free trial: $15 credit)
# 2. Get Account SID & Auth Token from console
# 3. Purchase phone number (cost: $1-2/month)
# 4. Add to production environment:
export TWILIO_ACCOUNT_SID=ACxxxxxxx
export TWILIO_AUTH_TOKEN=xxxxx
export TWILIO_PHONE_NUMBER=+1234567890

# 5. Restart API
docker restart hajjmed-api

# 6. Test:
curl -X POST https://yourdomain.com/api/v1/auth/sms-verification \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890"}'
```

**Cost:** Free trial ($15) or $0.01-0.10 per SMS

### C. File Storage (AWS S3)

**Setup:**
```bash
# 1. Create AWS account
# 2. Create S3 bucket: "hajjmed-prod"
# 3. Create IAM user with S3 access
# 4. Generate access keys
# 5. Add to production environment:
export OBJECT_STORAGE_ENDPOINT=https://s3.amazonaws.com
export OBJECT_STORAGE_REGION=us-east-1
export OBJECT_STORAGE_ACCESS_KEY=AKIA...
export OBJECT_STORAGE_SECRET_KEY=...
export OBJECT_STORAGE_BUCKET=hajjmed-prod

# 6. Restart API
docker restart hajjmed-api
```

**Cost:** Pay-as-you-go (~$0.023 per GB stored)

---

## SECTION 4: MOBILE APPS (2-3 hours)

### Build for iOS (App Store)

**Prerequisites:**
- Apple Developer Account ($99/year)
- MacOS machine with Xcode

**Steps:**
```bash
# 1. Go to mobile app directory
cd apps/mobile

# 2. Update API URL
echo 'EXPO_PUBLIC_API_URL=https://yourdomain.com/api/v1' >> .env.production

# 3. Build with EAS (Expo Application Services)
eas build --platform ios --auto-submit

# 4. In Xcode Organizer:
#    - Validate app
#    - Submit for review

# 5. Fill out App Store metadata:
#    - App name: HajjMed
#    - Subtitle: Healthcare for Hajj pilgrims
#    - Description: Medical screening platform...
#    - Screenshots: 5-6 screenshots
#    - Keywords: health, hajj, pilgrims, medical

# 6. Wait 1-3 days for review
```

### Build for Android (Google Play Store)

**Prerequisites:**
- Google Play Developer Account ($25 one-time)
- Google Play service account JSON key

**Steps:**
```bash
# 1. Update API URL
echo 'EXPO_PUBLIC_API_URL=https://yourdomain.com/api/v1' >> .env.production

# 2. Build with EAS
eas build --platform android --auto-submit

# 3. In Google Play Console:
#    - Create release (internal testing first)
#    - Upload APK/AAB
#    - Fill app store listing
#    - Add screenshots, description
#    - Request review

# 4. Wait 2-4 hours for review
```

---

## SECTION 5: CI/CD PIPELINE (1 hour)

### Setup GitHub Actions

**Already configured in `.github/workflows/`**

**Just add GitHub Secrets:**

1. Go to repository → Settings → Secrets
2. Add these secrets:

```
DOCKER_HUB_USERNAME = amzan96
DOCKER_HUB_TOKEN = (from Docker Hub)

DEPLOY_HOST = your-server-ip
DEPLOY_USER = root
DEPLOY_KEY = (your SSH private key)

SLACK_WEBHOOK_URL = (optional, for notifications)
```

**Automatic workflow:**
```
1. Push to main branch
2. GitHub Actions:
   - Builds Docker image
   - Runs tests
   - Pushes to Docker Hub
   - Deploys to server
   - Sends Slack notification
3. Your API updates automatically! 🚀
```

---

## SECTION 6: MONITORING & ALERTS (1 hour)

### Access Monitoring Dashboard

```
- Grafana (Dashboards): https://monitoring.yourdomain.com
- Prometheus (Metrics): http://yourdomain.com:9090
- Loki (Logs): Integrated in Grafana
```

### Set up Alerts

**In Grafana:**
1. Create Alert Policy for:
   - API down (health check fails)
   - High memory (>80%)
   - High CPU (>80%)
   - Database errors
   - Request errors (>5%)

2. Set notification channel:
   - Slack webhook
   - Email
   - PagerDuty
   - Webhook

### Optional: Sentry Error Tracking

```bash
# 1. Sign up at https://sentry.io (free tier)
# 2. Create project (Node.js)
# 3. Get DSN
# 4. Add to production environment:
export SENTRY_DSN=https://xxx@sentry.io/project-id

# 5. All production errors automatically reported
```

---

## SECTION 7: PRODUCTION CHECKLIST

### Before Going Live

- [ ] Domain registered and DNS configured
- [ ] SSL certificate working (HTTPS)
- [ ] API responding at domain
- [ ] Email service tested
- [ ] SMS service tested
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] CI/CD pipeline working
- [ ] Mobile apps in stores
- [ ] GitHub secrets configured
- [ ] Firewall rules configured
- [ ] Disaster recovery plan documented

### Run Pre-flight Check

```bash
chmod +x production-checklist.sh
./production-checklist.sh
```

---

## SECTION 8: SECURITY HARDENING

### Network Security
```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
```

### Secrets Management
```bash
# NEVER commit secrets!
# Always use GitHub Secrets for:
- Database credentials
- API keys
- JWT secrets
- SSH keys
```

### Database Backups
```bash
# Automated daily backups
0 2 * * * docker compose -f docker-compose.production.yml exec -T postgres pg_dump -U postgres hajjmed > /backups/db_$(date +%Y%m%d_%H%M%S).sql

# Test restore
docker exec -i hajjmed-postgres psql -U postgres < backup_file.sql
```

### Rate Limiting
```
# Already configured:
- 60 requests per minute per IP
- CORS headers enabled
- HTTPS redirect
- Security headers
```

---

## SECTION 9: TROUBLESHOOTING

### API Not Responding
```bash
# Check status
docker ps | grep hajjmed-api

# View logs
docker logs hajjmed-api --tail 50

# Restart
docker restart hajjmed-api

# Test health
curl https://yourdomain.com/health/ready
```

### SSL Certificate Issues
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443

# Force renewal
docker compose -f docker-compose.production.yml exec caddy caddy renew --force

# View Caddy logs
docker logs hajjmed-caddy
```

### Database Connection Errors
```bash
# Test connection
docker compose -f docker-compose.production.yml exec postgres psql -U postgres -d hajjmed -c "SELECT 1;"

# Check environment variables
docker exec hajjmed-api env | grep DATABASE_URL

# Restart API
docker restart hajjmed-api
```

### High Memory Usage
```bash
# Check which service
docker stats

# View memory logs
docker logs hajjmed-api --tail 100 | grep memory

# Increase Docker memory limit
# Edit docker-compose.production.yml
# Set higher deploy.resources.limits.memory
```

---

## SECTION 10: ONGOING MAINTENANCE

### Daily (Automated)
- [ ] Health checks running
- [ ] Backups created
- [ ] Logs collected

### Weekly
- [ ] Review error logs
- [ ] Check monitoring dashboards
- [ ] Verify backups

### Monthly
- [ ] Update Docker images
- [ ] Review security logs
- [ ] Rotate API keys
- [ ] Performance review

### Quarterly
- [ ] Penetration testing (optional)
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning

---

## SECTION 11: COST BREAKDOWN

| Component | Provider | Cost/Month |
|-----------|----------|-----------|
| Server | DigitalOcean | $6-12 |
| Database | Supabase | $25-100 |
| Email | Sendgrid | $0-15 |
| SMS | Twilio | $0-50 |
| Object Storage | AWS S3 | $5-20 |
| Monitoring | Included | Free |
| Domain | Namecheap | $1-2 |
| SSL | Let's Encrypt | Free |
| **TOTAL** | | **$42-199** |

---

## SECTION 12: SUPPORT RESOURCES

### Documentation
- API Docs: https://yourdomain.com/docs
- Swagger UI: https://yourdomain.com/docs
- GitHub: https://github.com/yourusername/HajjMed
- Production Guide: PRODUCTION-DEPLOYMENT.md

### Community
- Fastify: https://fastify.dev
- Supabase: https://supabase.com/docs
- Expo: https://docs.expo.dev
- Docker: https://docs.docker.com

### Getting Help
1. Check logs: `docker logs hajjmed-api`
2. Check monitoring: https://monitoring.yourdomain.com
3. Review GitHub Issues
4. Post in community forums
5. Contact hosting provider support

---

## FINAL CHECKLIST

- [ ] SECTION 1: Quick Start complete
- [ ] SECTION 2: Deployment complete
- [ ] SECTION 3: Services configured
- [ ] SECTION 4: Mobile apps deployed
- [ ] SECTION 5: CI/CD working
- [ ] SECTION 6: Monitoring set up
- [ ] SECTION 7: Pre-flight checks passed
- [ ] SECTION 8: Security hardened
- [ ] SECTION 9: Testing verified
- [ ] SECTION 10: Maintenance plan documented

## 🚀 YOU'RE LIVE!

Congratulations! Your HajjMed platform is now in production serving real users.

**Next Steps:**
1. Monitor performance
2. Gather user feedback
3. Plan v1.1 features
4. Scale based on usage

Questions? Check the docs or reach out to the community.

Happy deployment! 🎉
