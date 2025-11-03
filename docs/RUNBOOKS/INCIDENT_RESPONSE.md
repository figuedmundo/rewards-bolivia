# Incident Response Runbook

## Overview
This runbook provides procedures for handling production incidents in the Rewards Bolivia application.

## Incident Classification

### Severity Levels

- **SEV-1 (Critical)**: Complete system outage, data loss, security breach
- **SEV-2 (High)**: Major functionality broken, significant user impact
- **SEV-3 (Medium)**: Minor functionality issues, partial user impact
- **SEV-4 (Low)**: Cosmetic issues, monitoring alerts

## Response Procedures

### Phase 1: Detection & Assessment (0-5 minutes)

1. **Alert Reception**
   - Check monitoring dashboards (Grafana)
   - Review error logs in Kibana/ELK
   - Check PagerDuty/Slack alerts

2. **Initial Assessment**
   ```bash
   # Check service health
   curl -f https://api.rewardsbolivia.com/api/health

   # Check error rates
   curl https://api.rewardsbolivia.com/api/metrics | grep error

   # Check database connectivity
   kubectl exec deployment/api -- nc -z db-service 5432
   ```

3. **Declare Incident**
   - Create incident in incident management tool
   - Notify incident response team
   - Set severity level

### Phase 2: Investigation (5-30 minutes)

1. **Gather Evidence**
   ```bash
   # Collect recent logs
   kubectl logs --since=30m deployment/api > api_logs.txt
   kubectl logs --since=30m deployment/worker > worker_logs.txt

   # Check metrics history
   # Query Prometheus for trends
   ```

2. **Identify Root Cause**
   - Database issues: Check connection pools, slow queries
   - API issues: Check dependency failures, rate limiting
   - Worker issues: Check queue depth, job failures
   - External services: Check third-party API status

3. **Assess Impact**
   - User-facing features affected
   - Data integrity concerns
   - Financial transaction impact

### Phase 3: Containment (30-60 minutes)

1. **Implement Temporary Fix**
   ```bash
   # Scale up resources if needed
   kubectl scale deployment api --replicas=5

   # Restart problematic pods
   kubectl rollout restart deployment/api

   # Enable circuit breakers
   # Update feature flags to disable problematic features
   ```

2. **Communicate Status**
   - Update incident ticket
   - Notify stakeholders
   - Post status page update

### Phase 4: Recovery (1-4 hours)

1. **Implement Permanent Fix**
   ```bash
   # Deploy hotfix
   git checkout -b hotfix/incident-123
   # Make changes
   npm run build
   kubectl apply -f k8s/

   # Run database fixes if needed
   kubectl exec deployment/api -- npx prisma db push
   ```

2. **Validate Fix**
   ```bash
   # Run health checks
   npm run test:e2e

   # Monitor metrics for 30 minutes
   # Verify user flows work
   ```

### Phase 5: Post-Incident Review (Next Business Day)

1. **Incident Retrospective**
   - What happened?
   - Why did it happen?
   - How was it detected?
   - What was the impact?
   - How can we prevent it?

2. **Action Items**
   - Implement monitoring improvements
   - Update runbooks
   - Code fixes
   - Process improvements

## Common Incident Scenarios

### Database Connection Issues

**Symptoms**: API returning 500 errors, slow responses

**Investigation**:
```bash
# Check connection pool
kubectl exec deployment/api -- npx prisma studio --check

# Check database logs
kubectl logs deployment/postgres

# Verify network connectivity
kubectl exec deployment/api -- telnet db-service 5432
```

**Resolution**:
- Scale database replicas
- Restart connection pools
- Check for connection leaks

### Worker Queue Backlog

**Symptoms**: Jobs not processing, increasing queue depth

**Investigation**:
```bash
# Check queue status
kubectl exec deployment/worker -- redis-cli LLEN reconciliation

# Check worker logs
kubectl logs deployment/worker --tail=100

# Verify Redis connectivity
kubectl exec deployment/worker -- redis-cli ping
```

**Resolution**:
- Scale worker deployment
- Clear failed jobs
- Restart worker processes

### API Rate Limiting Issues

**Symptoms**: 429 errors, legitimate users blocked

**Investigation**:
```bash
# Check rate limiter metrics
curl localhost:3001/metrics | grep rate_limit

# Review access patterns
# Check for DDoS attempts
```

**Resolution**:
- Adjust rate limits
- Implement progressive delays
- Add IP whitelisting

## Communication Templates

### Initial Response
```
INCIDENT DECLARED: [Brief description]

Status: Investigating
Impact: [User/business impact]
ETA: [Estimated resolution time]

We're investigating and will provide updates every 30 minutes.
```

### Status Update
```
UPDATE: [Current status]

What we know: [Findings]
What we're doing: [Actions]
Next update: [Time]
```

### Resolution
```
INCIDENT RESOLVED: [Brief description]

Root cause: [What happened]
Resolution: [What was fixed]
Prevention: [Future measures]

Post-mortem will be scheduled for [time].
```

## Escalation Paths

- **Engineering Lead**: For technical decisions
- **Product Manager**: For business impact assessment
- **Security Team**: For security-related incidents
- **Legal/Compliance**: For data breach incidents
- **Executive Team**: For SEV-1 incidents

## Tools & Resources

- **Monitoring**: Grafana, Prometheus, AlertManager
- **Logging**: ELK Stack, Kibana
- **Incident Management**: PagerDuty, Jira Service Desk
- **Communication**: Slack, StatusPage.io
- **Documentation**: This runbook, Confluence

## Training Requirements

All team members should:
- Know how to declare incidents
- Understand severity classification
- Be familiar with basic troubleshooting commands
- Know communication protocols

Regular drills should be conducted quarterly.