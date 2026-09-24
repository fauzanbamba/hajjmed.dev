# GitHub Actions Secrets Configuration

This guide explains how to set up GitHub Secrets for the HajjMed CI/CD workflows.

## Step 1: Generate Docker Hub Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Set name: `HajjMed CI/CD`
4. Select scope: `Read, Write, Delete`
5. Click "Generate"
6. Copy the token (you'll only see it once)

## Step 2: Add Secrets to GitHub

### For Docker Hub Push (Required)

Go to: Repository → Settings → Secrets and variables → Actions

Click "New repository secret" for each:

| Secret Name | Value | Required |
|-----------|-------|----------|
| `DOCKER_HUB_USERNAME` | `amzan96` | ✅ Yes |
| `DOCKER_HUB_TOKEN` | Your Docker Hub token from Step 1 | ✅ Yes |

**Example for DOCKER_HUB_TOKEN:**
```
dckr_pat_xxxxxxxxxxxxxxxxxxxxxxxx
```

### For Remote Server Deployment (Optional)

| Secret Name | Value | Required |
|-----------|-------|----------|
| `DEPLOY_HOST` | `your.server.com` or IP | ❌ Optional |
| `DEPLOY_USER` | SSH username (e.g., `ubuntu`, `deploy`) | ❌ Optional |
| `DEPLOY_SSH_KEY` | SSH private key | ❌ Optional |

### For Slack Notifications (Optional)

| Secret Name | Value | Required |
|-----------|-------|----------|
| `SLACK_WEBHOOK_URL` | Your Slack webhook URL | ❌ Optional |

---

## Step 3: Verify Secrets

```bash
# In your repository, you should see:
# ✓ DOCKER_HUB_USERNAME
# ✓ DOCKER_HUB_TOKEN
# ✓ (DEPLOY_* if configured)
# ✓ (SLACK_WEBHOOK_URL if configured)
```

**Note:** GitHub hides the values for security. You cannot view them after creation.

---

## Step 4: Test the Workflow

1. Push code to `main` or `develop` branch
2. Go to Repository → Actions
3. Watch the workflow execute
4. Verify the image was pushed to Docker Hub

**Expected output:**
```
✓ Log in to Docker Hub
✓ Extract metadata
✓ Build and push Docker image
✓ Docker image successfully built and pushed!
```

---

## Generating SSH Key for Remote Deployment

If deploying to a remote server, generate an SSH key:

### On your local machine:

```bash
# Generate key (no passphrase for CI/CD)
ssh-keygen -t ed25519 -f ~/.ssh/hajjmed-deploy -N ""

# Display the private key (for GitHub)
cat ~/.ssh/hajjmed-deploy

# Display the public key (for server)
cat ~/.ssh/hajjmed-deploy.pub
```

### Add to GitHub Secrets:

Copy the **entire private key** (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) to `DEPLOY_SSH_KEY` secret.

### Add to Remote Server:

```bash
# SSH into your server
ssh deploy-user@your.server.com

# Add public key to authorized_keys
echo "ssh-ed25519 AAAAC3Nza... (public key)" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Verify (you should be able to SSH without password)
ssh -i ~/.ssh/hajjmed-deploy deploy-user@your.server.com
```

---

## Generating Slack Webhook URL

To send deployment notifications to Slack:

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App Name: `HajjMed Deployments`
4. Select your workspace
5. In left sidebar, go to "Incoming Webhooks"
6. Click "Add New Webhook to Workspace"
7. Select channel (e.g., `#deployments`)
8. Copy the webhook URL
9. Add to GitHub Secrets as `SLACK_WEBHOOK_URL`

**Example:**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

---

## Troubleshooting

### "Docker push failed: unauthorized"

**Problem:** `Error response from daemon: unauthorized`

**Solution:**
1. Verify `DOCKER_HUB_USERNAME` is exactly `amzan96`
2. Verify `DOCKER_HUB_TOKEN` is a valid access token (not password)
3. Regenerate token if unsure: https://hub.docker.com/settings/security
4. Update the GitHub Secret

### "SSH connection failed"

**Problem:** `ssh: Permission denied (publickey)`

**Solution:**
1. Verify server SSH is running: `ssh-v` from local machine
2. Verify public key is in `~/.ssh/authorized_keys` on server
3. Verify private key in `DEPLOY_SSH_KEY` secret is complete (includes `-----BEGIN` and `-----END`)
4. Check SSH permissions on server: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`

### "Workflow not triggering"

**Problem:** Push to main/develop doesn't trigger workflow

**Solution:**
1. Verify workflow file exists: `.github/workflows/docker-build.yml`
2. Verify workflow has correct branch filters:
   ```yaml
   on:
     push:
       branches:
         - main
         - develop
   ```
3. Try manual trigger: Go to Actions → select workflow → "Run workflow"

### "Secret value not being used"

**Problem:** Workflow still fails despite adding secrets

**Solution:**
1. Verify secret name exactly matches workflow file:
   ```yaml
   username: ${{ secrets.DOCKER_HUB_USERNAME }}
   password: ${{ secrets.DOCKER_HUB_TOKEN }}
   ```
2. Verify secret is set in the correct repository (not organization or user level)
3. Wait 1-2 minutes after adding secret before running workflow

---

## Security Best Practices

✅ **Always use fine-grained tokens** - not personal access tokens

✅ **Rotate secrets regularly** - at least quarterly

✅ **Use separate tokens per environment** - staging vs production

✅ **Never commit secrets to repository** - use .env for local, GitHub Secrets for CI

✅ **Audit secret access** - GitHub Actions logs show secret usage

✅ **Limit SSH key scope** - use dedicated deploy user, not root

✅ **Use environment-specific secrets** - GitHub Environments feature

---

## Next Steps

1. ✅ Add `DOCKER_HUB_USERNAME` and `DOCKER_HUB_TOKEN`
2. ✅ Push code to trigger the build workflow
3. ✅ Verify image appears on Docker Hub
4. ✅ (Optional) Add remote deployment secrets
5. ✅ (Optional) Add Slack notification webhook
6. ✅ Monitor workflows in Actions tab
