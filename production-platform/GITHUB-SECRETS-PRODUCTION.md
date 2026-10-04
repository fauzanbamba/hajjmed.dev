# ============================================================================
# GITHUB PRODUCTION SECRETS SETUP
# ============================================================================
# Add these secrets to GitHub for automated CI/CD deployment
# 
# Go to: GitHub → Settings → Secrets and variables → Actions → New repository secret

## ============================================================================
## DOCKER HUB (For building & pushing Docker images)
## ============================================================================
# Name: DOCKER_HUB_USERNAME
# Value: amzan96
#
# Name: DOCKER_HUB_TOKEN
# Value: (Get from https://hub.docker.com/settings/security)
#   1. Go to Docker Hub → Account Settings → Security
#   2. Click "New Access Token"
#   3. Name it "GitHub Actions"
#   4. Copy the token
#   5. Paste as value

## ============================================================================
## PRODUCTION SERVER SSH (For deploying to production)
## ============================================================================
# Name: DEPLOY_HOST
# Value: your-server-ip (e.g., 192.168.1.1)
#
# Name: DEPLOY_USER  
# Value: root (or your deploy user)
#
# Name: DEPLOY_KEY
# Value: (SSH private key)
#   1. Generate on your local machine:
#      ssh-keygen -t ed25519 -f deploy_key -N ""
#   2. Add public key to server:
#      cat deploy_key.pub >> ~/.ssh/authorized_keys
#   3. Copy entire content of deploy_key (private key) here
#   4. Keep deploy_key.pub safe for backup
#
# Name: DEPLOY_PATH
# Value: /app/HajjMed (or your deployment path)

## ============================================================================
## SUPABASE PRODUCTION (For database migrations)
## ============================================================================
# Name: SUPABASE_PROJECT_ID
# Value: your-project-id (from Supabase dashboard URL)
#
# Name: SUPABASE_ACCESS_TOKEN
# Value: (Get from https://app.supabase.com/account/tokens)
#   1. Go to Supabase → Account → Access Tokens
#   2. Click "Generate new token"
#   3. Copy and paste here

## ============================================================================
## ENVIRONMENT VARIABLES (Production .env values)
## ============================================================================
# Name: SUPABASE_URL_PROD
# Value: https://your-project.supabase.co
#
# Name: SUPABASE_ANON_KEY_PROD
# Value: (Get from Supabase → Project Settings → API)
#
# Name: SUPABASE_SERVICE_ROLE_KEY_PROD
# Value: (Get from Supabase → Project Settings → API)
#
# Name: JWT_ACCESS_SECRET_PROD
# Value: (Generate: openssl rand -base64 64)
#
# Name: JWT_REFRESH_SECRET_PROD
# Value: (Generate: openssl rand -base64 64)
#
# Name: SENDGRID_API_KEY_PROD
# Value: (Get from https://app.sendgrid.com/settings/api_keys)
#
# Name: TWILIO_ACCOUNT_SID_PROD
# Value: (Get from https://www.twilio.com/console)
#
# Name: TWILIO_AUTH_TOKEN_PROD
# Value: (Get from https://www.twilio.com/console)

## ============================================================================
## NOTIFICATIONS (Optional)
## ============================================================================
# Name: SLACK_WEBHOOK_URL
# Value: (Get from Slack → Incoming Webhooks)
#   1. Go to https://api.slack.com/apps
#   2. Create New App
#   3. Enable "Incoming Webhooks"
#   4. Add New Webhook to Channel
#   5. Copy webhook URL
#
# Name: SLACK_CHANNEL
# Value: #deployments (or your channel name)
#
# Name: SLACK_BOT_TOKEN
# Value: xoxb-... (optional, for more detailed messages)

## ============================================================================
## MOBILE APP BUILD (Optional - for EAS builds)
## ============================================================================
# Name: EAS_TOKEN
# Value: (Get from https://expo.dev/settings/access-tokens)
#   1. Go to Expo → Settings → Access Tokens
#   2. Create new token
#   3. Copy and paste here
#
# Name: APPLE_ID
# Value: your-apple-id@email.com
#
# Name: APPLE_ID_PASSWORD
# Value: (Apple-specific app password)
#   1. Go to https://appleid.apple.com/account/home
#   2. Security → App-Specific Passwords
#   3. Generate new password for "GitHub Actions"
#   4. Copy and paste here
#
# Name: APPLE_TEAM_ID
# Value: (From Apple Developer account)
#
# Name: GOOGLE_PLAY_KEY
# Value: (JSON content of service account key)
#   1. Google Cloud Console → Create Service Account
#   2. Download JSON key
#   3. Copy entire JSON content

## ============================================================================
## HOW TO ADD SECRETS IN GITHUB
## ============================================================================
# 1. Go to your repository on GitHub
# 2. Click "Settings" tab
# 3. Left sidebar → "Secrets and variables" → "Actions"
# 4. Click "New repository secret"
# 5. Enter Name (exactly as specified above)
# 6. Enter Value (from instructions)
# 7. Click "Add secret"
# 8. Repeat for each secret

## ============================================================================
## SECURITY BEST PRACTICES
## ============================================================================
# ✅ DO:
#   - Rotate secrets quarterly
#   - Use strong passwords (min 32 chars for tokens)
#   - Use separate credentials for production/development
#   - Limit SSH key permissions (read-only for deployment)
#   - Enable 2FA on Supabase, Docker Hub, GitHub accounts
#   - Store backups of SSH keys in secure location
#
# ❌ DON'T:
#   - Share secrets in emails or chat
#   - Commit secrets to Git
#   - Use same credentials for multiple services
#   - Disable 2FA
#   - Save secrets in plain text files
#   - Share SSH private keys

## ============================================================================
## VERIFICATION
## ============================================================================
# After adding all secrets, verify by:
# 1. Go to repository settings
# 2. Click "Actions" → "Run workflow"
# 3. Check if workflow completes successfully
# 4. Review workflow logs for errors
# 5. Verify deployment on production server

## ============================================================================
## EMERGENCY: REVOKE COMPROMISED SECRETS
## ============================================================================
# If any secret is exposed:
# 1. Immediately delete from GitHub Secrets
# 2. Rotate the actual secret (new API key, new SSH key, etc.)
# 3. Audit logs for unauthorized access
# 4. Update all dependent systems
# 5. Document incident

# Example rotation steps:
# - Docker Hub Token: Security → Delete existing → Generate new
# - SSH Key: Remove from authorized_keys → Generate new keypair
# - Supabase Key: Project Settings → API → Regenerate
# - Twilio: Console → Auth Tokens → Rotate
