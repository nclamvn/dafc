# Deployment Guide

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 20.x or higher
- npm 10.x or higher
- PostgreSQL 16.x
- Docker & Docker Compose (for containerized deployment)
- Git

### Optional
- Redis 7.x (for caching)
- Nginx (for reverse proxy)

---

## Environment Setup

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dafc_otb` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Session secret (min 32 chars) | `your-super-secret-key-here` |
| `AUTH_SECRET` | Auth.js secret | `same-as-nextauth-secret` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Claude AI API key | - |
| `SENTRY_DSN` | Sentry error tracking | - |
| `REDIS_URL` | Redis connection URL | - |
| `LOG_LEVEL` | Logging level | `info` |

---

## Local Development

### Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

---

## Docker Deployment

### Development with Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

### Services
- **app**: Next.js application (port 3000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)
- **adminer**: Database UI (port 8081)

### Production with Docker

```bash
# Build production image
docker build -t dafc-otb-platform:latest .

# Start production stack
docker compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:3000/api/v1/health
```

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Set strong `NEXTAUTH_SECRET` (min 32 characters)
- [ ] Configure `NEXTAUTH_URL` to production domain
- [ ] Set up SSL certificates
- [ ] Configure database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Review security headers

### Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start the application**
   ```bash
   npm run start
   ```

### Using PM2 (recommended for VPS)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "dafc-otb" -- start

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push/PR to main | Lint, test, build |
| `cd.yml` | Tag push | Deploy to staging/production |
| `security.yml` | Weekly/Push | Security scanning |

### Deployment Flow

```
Push to main
    │
    ├─► Lint ──► Test ──► Build
    │                      │
    │                      ▼
    │              Docker Build
    │                      │
    │                      ▼
    │              Deploy Staging
    │                      │
    │                      ▼
    │              Deploy Production
    │                      │
    │                      ▼
    └─────────────► Health Check
```

### Creating a Release

```bash
# Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

---

## Monitoring

### Health Check Endpoint

```bash
# Basic health check
curl http://localhost:3000/api/v1/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-01-08T...",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": {
    "database": { "status": "pass" },
    "memory": { "status": "pass" },
    "api": { "status": "pass" }
  }
}
```

### Logging

Logs are output in JSON format in production. Configure log aggregation with:
- CloudWatch Logs
- Elasticsearch/Kibana
- Datadog

### Error Tracking

Configure Sentry by setting `SENTRY_DSN` environment variable.

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Docker Issues
```bash
# Reset Docker environment
docker compose down -v
docker system prune -f
docker compose up -d --build
```

### Getting Help

- Check logs: `docker compose logs app`
- Health check: `curl /api/v1/health`
- Contact: support@dafc.com
