# Infrastructure as Code (IaC)

This directory contains all the necessary files for defining, provisioning, and managing the infrastructure for the Rewards Bolivia project.

## Directory Structure

```
infra/
├── local/                 # Development environment
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
└── prod/                  # Production environment
    ├── README.md
    └── [kubernetes/terraform files]
```

## Development Environment Setup

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm or yarn

### Quick Start

1. **Start Infrastructure**
   ```bash
   cd infra/local
   docker-compose up -d
   ```

2. **Verify Services**
   ```bash
   # Check database
   docker-compose exec postgres psql -U rewards_user -d rewards_db

   # Check Redis
   docker-compose exec redis redis-cli ping
   ```

3. **Environment Variables**
   ```bash
   # Copy and configure
   cp .env.example .env

   # Required variables
   DATABASE_URL="postgresql://rewards_user:password@localhost:5432/rewards_db"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-secret-key"
   ```

4. **Database Setup**
   ```bash
   cd packages/api

   # Run migrations
   npx prisma migrate deploy

   # Generate Prisma client
   npx prisma generate

   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Start Application**
   ```bash
   # Terminal 1: API
   npm run --workspace=api start:dev

   # Terminal 2: Worker
   npm run --workspace=@rewards-bolivia/worker start

   # Terminal 3: Web App
   npm run --workspace=web dev
   ```

### Development Workflows

#### Adding New Dependencies
```bash
# Add to API
npm install --workspace=api new-package

# Add to Web
npm install --workspace=web react-package

# Install all
npm install
```

#### Database Changes
```bash
cd packages/api

# Create migration
npx prisma migrate dev --name add_new_table

# Update schema
# Edit prisma/schema.prisma

# Apply to dev database
npx prisma db push
```

#### Testing
```bash
# Run all tests
npm run test

# Run API tests only
npm run --workspace=api test

# Run E2E tests
npm run --workspace=api test:e2e
```

## Production Environment

### Deployment Overview

Production uses Kubernetes for orchestration with the following components:

- **API Service**: NestJS application with Prisma ORM
- **Web Service**: React SPA served by Nginx
- **Worker Service**: Background job processor
- **Database**: PostgreSQL with connection pooling
- **Cache**: Redis cluster
- **Monitoring**: Prometheus + Grafana

### Deployment Steps

1. **Build Images**
   ```bash
   # Build API
   docker build -f packages/api/Dockerfile.prod -t rewards-bolivia/api:$VERSION packages/api

   # Build Web
   docker build -f packages/web/Dockerfile.prod -t rewards-bolivia/web:$VERSION packages/web

   # Push to registry
   docker push rewards-bolivia/api:$VERSION
   docker push rewards-bolivia/web:$VERSION
   ```

2. **Deploy to Kubernetes**
   ```bash
   cd infra/prod

   # Update image versions in k8s manifests
   sed -i "s|rewards-bolivia/api:.*|rewards-bolivia/api:$VERSION|g" k8s/api-deployment.yaml

   # Apply changes
   kubectl apply -f k8s/

   # Check rollout
   kubectl rollout status deployment/api
   kubectl rollout status deployment/web
   ```

3. **Database Migration**
   ```bash
   # Run migrations
   kubectl exec deployment/api -- npx prisma migrate deploy

   # Verify health
   curl https://api.rewardsbolivia.com/api/health
   ```

### Environment Variables

Production environment variables are managed through Kubernetes secrets:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: api-secrets
type: Opaque
data:
  DATABASE_URL: <base64-encoded>
  JWT_SECRET: <base64-encoded>
  REDIS_URL: <base64-encoded>
```

### Monitoring Setup

1. **Metrics Collection**
   - API exposes `/api/metrics` endpoint
   - Prometheus scrapes metrics every 30s
   - Grafana dashboards for visualization

2. **Logging**
   - Structured JSON logs
   - Correlation IDs for request tracing
   - ELK stack for log aggregation

3. **Alerting**
   - Error rate > 5%
   - Response time > 2s
   - Database connection issues

## Troubleshooting

### Common Development Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3001
   lsof -i :5173

   # Stop conflicting services
   docker-compose down
   ```

2. **Database Connection Issues**
   ```bash
   # Reset database
   cd infra/local
   docker-compose down -v
   docker-compose up -d

   # Re-run migrations
   cd packages/api
   npx prisma migrate reset
   ```

3. **Worker Not Starting**
   ```bash
   # Check Redis connection
   docker-compose exec redis redis-cli ping

   # Check worker logs
   npm run --workspace=@rewards-bolivia/worker start
   ```

### Production Issues

1. **Pod Crashes**
   ```bash
   # Check pod status
   kubectl get pods

   # View logs
   kubectl logs -f deployment/api

   # Describe pod
   kubectl describe pod <pod-name>
   ```

2. **Service Unavailable**
   ```bash
   # Check ingress
   kubectl get ingress

   # Test service directly
   kubectl port-forward svc/api 3001:3001
   curl localhost:3001/api/health
   ```

## Security Considerations

- **Secrets Management**: Use Kubernetes secrets, never commit to git
- **Network Policies**: Restrict pod-to-pod communication
- **RBAC**: Implement role-based access control
- **Image Scanning**: Scan Docker images for vulnerabilities
- **SSL/TLS**: Enable HTTPS everywhere

## Performance Optimization

- **Database**: Connection pooling, query optimization
- **Cache**: Redis for session and API response caching
- **CDN**: Static assets served via CDN
- **Horizontal Scaling**: Kubernetes HPA for auto-scaling

## Related Documentation

- [Deployment Runbook](../docs/RUNBOOKS/DEPLOYMENT.md)
- [Database Migrations](../docs/DB_MIGRATIONS.md)
- [Incident Response](../docs/RUNBOOKS/INCIDENT_RESPONSE.md)
- [API Documentation](../packages/api/README.md)
