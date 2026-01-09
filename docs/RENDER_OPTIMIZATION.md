# Render Deployment Optimization Guide

## 🐌 Problem 1: Slow Cold Start (Free Tier)

### Root Cause
Render Free Tier "sleeps" after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

### Solutions

#### Option A: Keep-Alive Cron Job (Free)
Use external service to ping your app every 10 minutes:

**1. Using cron-job.org (Free)**
1. Go to https://cron-job.org
2. Create free account
3. Add new cron job:
   - URL: `https://dafc-otb-platform.onrender.com/api/v1/health`
   - Schedule: Every 10 minutes (`*/10 * * * *`)
   - Method: GET

**2. Using UptimeRobot (Free)**
1. Go to https://uptimerobot.com
2. Create free account
3. Add new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://dafc-otb-platform.onrender.com/api/v1/health`
   - Monitoring Interval: 5 minutes

**3. Using GitHub Actions (Free)**
Add this workflow to your repo:

```yaml
# .github/workflows/keep-alive.yml
name: Keep Render Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: |
          curl -s https://dafc-otb-platform.onrender.com/api/v1/health || true
          echo "Pinged at $(date)"
```

#### Option B: Upgrade to Paid Tier ($7/month)
- No cold starts
- Always-on service
- Better performance
- Recommended for production

---

## 🤖 Problem 2: AI Not Working

### Quick Test
Visit: https://dafc-otb-platform.onrender.com/api/ai/test

### Expected Response (if working):
```json
{
  "status": "success",
  "response": "AI is working!",
  "latencyMs": 500,
  "hasKey": true,
  "keyPrefix": "sk-proj-xx..."
}
```

### If `hasKey: false`:

**Step 1: Add OpenAI API Key on Render**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service: `dafc-otb-platform`
3. Click "Environment" tab
4. Add new environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (your OpenAI key)
5. Click "Save Changes"
6. Wait for auto-redeploy (2-3 minutes)

**Step 2: Verify**
After redeploy, visit `/api/ai/test` again

### If Error: "401 Unauthorized" or "Invalid API Key":
1. Verify your OpenAI API key is valid at https://platform.openai.com/api-keys
2. Check if you have credits/billing set up
3. Generate a new key if needed

---

## 📋 Environment Variables Checklist

Ensure these are set on Render:

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | `postgresql://...` |
| `NEXTAUTH_URL` | ✅ | `https://dafc-otb-platform.onrender.com` |
| `AUTH_SECRET` | ✅ | `your-secret-key` |
| `OPENAI_API_KEY` | ✅ (for AI) | `sk-proj-...` |
| `NODE_ENV` | ✅ | `production` |

**Note:** Do NOT set both `AUTH_SECRET` and `NEXTAUTH_SECRET` - use only `AUTH_SECRET`.

---

## 🔍 Debugging Commands

### Check if app is running:
```bash
curl https://dafc-otb-platform.onrender.com/api/v1/health
```

### Check AI status:
```bash
curl https://dafc-otb-platform.onrender.com/api/ai/test
```

### Test authentication:
```bash
curl -X POST https://dafc-otb-platform.onrender.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dafc.com","password":"admin123"}'
```

---

## 🚀 Performance Tips

1. **Pre-warm before demo**: Visit the app 1-2 minutes before showing to clients
2. **Monitor cold starts**: Use Render dashboard metrics to track response times
3. **Consider Starter Plan**: $7/month eliminates cold starts entirely
4. **Use Health Checks**: Render's built-in health checks can restart unhealthy instances

---

## 📊 Response Time Expectations

| State | Response Time |
|-------|---------------|
| Cold Start (sleeping) | 30-60 seconds |
| Warm (active) | 100-500ms |
| After Keep-Alive | Always warm |
| Paid Tier | Always 100-500ms |
