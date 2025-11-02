# Deployment Runbook

## Overview
This runbook covers deployment procedures for the Rewards Bolivia application across different environments.

## Environments

### Development
- **Purpose**: Local development and testing
- **Infrastructure**: Docker Compose (infra/local/)
- **Database**: PostgreSQL in Docker
- **Cache**: Redis in Docker

### Staging
- **Purpose**: Pre-production testing
- **Infrastructure**: Kubernetes (infra/prod/)
- **Database**: Managed PostgreSQL
- **Cache**: Managed Redis

### Production
- **Purpose**: Live application
- **Infrastructure**: Kubernetes (infra/prod/)
- **Database**: Managed PostgreSQL with replicas
- **Cache**: Managed Redis cluster

## Deployment Steps

### Local Development Setup

1. **Prerequisites**
   ```bash
   # Install dependencies
   npm install

   # Copy environment file
   cp .env.example .env
   ```

2. **Start Infrastructure**
   ```bash
   cd infra/local
   docker-compose up -d
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npm run --workspace=api db:migrate

   # Seed database (optional)
   npm run --workspace=api db:seed
   ```

4. **Start Services**
   ```bash
   # Terminal 1: API
   npm run --workspace=api start:dev

   # Terminal 2: Worker
   npm run --workspace=@rewards-bolivia/worker start

   # Terminal 3: Web App
   npm run --workspace=web dev
   ```

### Production Deployment

1. **Build Artifacts**
   ```bash
   # Build all packages
   npm run build

   # Build Docker images
   docker build -f packages/api/Dockerfile.prod -t rewards-bolivia/api:latest packages/api
   docker build -f packages/web/Dockerfile.prod -t rewards-bolivia/web:latest packages/web
   ```

2. **Deploy to Kubernetes**
   ```bash
   cd infra/prod

   # Update images in k8s manifests
   kubectl apply -f k8s/

   # Check rollout status
   kubectl rollout status deployment/api
   kubectl rollout status deployment/web
   ```

3. **Database Migration**
   ```bash
   # Run migrations in production
   kubectl exec -it deployment/api -- npm run db:migrate
   ```

## Monitoring & Health Checks

### Health Endpoints
- API: `GET /api/health`
- Metrics: `GET /api/metrics`
- Worker: Check Redis queue status

### Logs
```bash
# API logs
kubectl logs -f deployment/api

# Worker logs
kubectl logs -f deployment/worker

# Check structured logs
kubectl logs deployment/api | jq '.message'
```

### Alerts
- API response time > 2s
- Error rate > 5%
- Queue depth > 1000 jobs
- Database connection issues

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous deployment
kubectl rollout undo deployment/api
kubectl rollout undo deployment/web
```

### Database Rollback
```bash
# If migration needs rollback
kubectl exec deployment/api -- npx prisma migrate reset --force
```

## Troubleshooting

### Common Issues

1. **Worker Not Processing Jobs**
   ```bash
   # Check Redis connection
   kubectl exec deployment/worker -- redis-cli ping

   # Check queue status
   kubectl exec deployment/worker -- redis-cli LLEN reconciliation
   ```

2. **API High Latency**
   ```bash
   # Check database connections
   kubectl exec deployment/api -- npx prisma studio --port 5555

   # Check metrics
   curl http://api-service/metrics
   ```

3. **Web App Build Failures**
   ```bash
   # Check build logs
   npm run --workspace=web build

   # Verify SDK generation
   npm run generate:sdk
   ```

## Security Considerations

- Rotate secrets quarterly
- Use least-privilege IAM roles
- Enable audit logging
- Regular security scans
- SSL/TLS everywhere

## Performance Optimization

- API: Enable gzip compression
- Database: Connection pooling
- Cache: Redis cluster for high availability
- CDN: Static assets via CDN
- Monitoring: Set up APM (Application Performance Monitoring)