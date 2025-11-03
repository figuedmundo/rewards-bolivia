# Database Migration Policy

## Overview
This document outlines the policies and procedures for database schema changes in the Rewards Bolivia application.

## Migration Principles

### 1. **Zero-Downtime Migrations**
- All migrations must be backward compatible
- Use expand/contract pattern for complex changes
- Test migrations on staging before production

### 2. **Version Control**
- Migrations are code and follow the same review process
- Migration files are immutable once merged
- Rollback scripts accompany all migrations

### 3. **Testing Requirements**
- Unit tests for migration logic
- Integration tests with migrated data
- E2E tests on staging environment

## Migration Workflow

### Phase 1: Development

1. **Create Migration**
   ```bash
   # From the root of the monorepo
   npm run --workspace=api db:migrate:dev -- --name add_user_roles
   ```

2. **Update Schema**
   - Modify `packages/api/prisma/schema.prisma`
   - Ensure backward compatibility
   - Add comments explaining changes

3. **Write Tests**
   ```typescript
   // packages/api/test/integration/migrations/add_user_roles.spec.ts
   describe('User Roles Migration', () => {
     it('should migrate existing users', async () => {
       // Test migration logic
     });
   });
   ```

### Phase 2: Code Review

1. **PR Requirements**
   - Migration file present
   - Schema changes documented
   - Tests included
   - Rollback plan documented

2. **Review Checklist**
   - [ ] Migration is backward compatible
   - [ ] Rollback strategy exists
   - [ ] Tests pass on CI
   - [ ] Data integrity preserved
   - [ ] Performance impact assessed

### Phase 3: Deployment

1. **Staging Deployment**
   ```bash
   # Apply migrations
   npm run --workspace=api db:migrate
   npm run test:migration-smoke
   ```

2. **Production Deployment**
   ```bash
   # Backup database
   pg_dump production_db > backup_$(date +%Y%m%d_%H%M%S).sql

   # Apply migrations
   npm run --workspace=api db:migrate

   # Verify application health
   curl https://api.rewardsbolivia.com/api/health
   ```

## Migration Types

### 1. **Safe Migrations** (Always Allowed)
- Adding nullable columns
- Adding new tables
- Adding indexes
- Renaming columns (with alias)

### 2. **Controlled Migrations** (Review Required)
- Adding non-nullable columns
- Changing column types
- Dropping columns/tables
- Complex data transformations

### 3. **High-Risk Migrations** (Architecture Review)
- Large data transformations
- Schema restructuring
- Multi-table changes

## Rollback Procedures

### Automatic Rollback
```bash
# Prisma rollback (if supported)
npx prisma migrate reset

# Manual rollback
npx prisma db push --force-reset
```

### Manual Rollback Scripts
Each migration must include a rollback script:

```sql
-- rollback_add_user_roles.sql
ALTER TABLE users DROP COLUMN role;
DROP TYPE user_role;
```

### Emergency Rollback
1. Restore from backup
2. Deploy previous application version
3. Investigate root cause
4. Plan safer migration approach

## Monitoring & Alerts

### Migration Metrics
- Migration duration
- Error rates during migration
- Data consistency checks

### Alerts
- Migration taking longer than 30 minutes
- Migration errors
- Post-migration data inconsistencies

## Data Integrity Checks

### Pre-Migration
```sql
-- Count records
SELECT COUNT(*) FROM users;

-- Check constraints
SELECT * FROM information_schema.table_constraints
WHERE table_name = 'users';
```

### Post-Migration
```sql
-- Verify data integrity
SELECT COUNT(*) FROM users WHERE role IS NULL;

-- Check foreign keys
SELECT * FROM information_schema.referential_constraints;
```

## Migration Testing

### Unit Tests
```typescript
describe('Migration: Add User Roles', () => {
  it('should handle existing users', async () => {
    const user = await prisma.user.create({ data: { email: 'test@example.com' } });
    await migrateUp();
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser.role).toBe('user');
  });
});
```

### Integration Tests
```typescript
describe('Migration Integration', () => {
  it('should work with application code', async () => {
    await migrateUp();
    // Test full application flow
    const response = await request(app).post('/api/auth/login');
    expect(response.status).toBe(200);
  });
});
```

### Smoke Tests
```bash
# packages/api/test/smoke/migration-smoke.test.ts
describe('Migration Smoke Tests', () => {
  it('should handle basic operations', async () => {
    // Test CRUD operations
    // Test relationships
    // Test constraints
  });
});
```

## Migration Dependencies

### Application Code
- Update TypeScript types after schema changes
- Update API endpoints if needed
- Update validation schemas

### External Systems
- Notify downstream consumers of schema changes
- Update data pipelines
- Update monitoring queries

## Best Practices

### 1. **Small, Incremental Changes**
- Break large migrations into smaller steps
- Test each step independently
- Easier to rollback if issues occur

### 2. **Idempotent Operations**
- Migrations should be safe to run multiple times
- Check for existing changes before applying

### 3. **Performance Considerations**
- Add indexes before large data operations
- Schedule migrations during low-traffic periods
- Monitor database performance during migration

### 4. **Documentation**
- Document all schema changes
- Include rationale for changes
- Update API documentation

## Emergency Procedures

### Migration Failure in Production
1. **Stop the Bleeding**
   - Stop application deployments
   - Assess user impact
   - Communicate with stakeholders

2. **Assess Damage**
   - Check data integrity
   - Identify affected users/features
   - Determine rollback feasibility

3. **Recovery Options**
   - Rollback migration
   - Apply hotfix
   - Manual data repair

4. **Post-Incident**
   - Root cause analysis
   - Update migration policies
   - Improve testing procedures

## Tools & Automation

### CI/CD Integration
```yaml
# .github/workflows/migration-check.yml
name: Migration Check
on: pull_request
jobs:
  migration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Migration
        run: npm run test:migration
```

### Automated Checks
- Schema drift detection
- Migration conflict detection
- Performance regression testing

## Contact Information

- **Database Administrator**: [Name] - [Contact]
- **DevOps Team**: [Slack Channel]
- **Incident Response**: [PagerDuty Schedule]

## Related Documents

- [Deployment Runbook](../RUNBOOKS/DEPLOYMENT.md)
- [Incident Response Runbook](../RUNBOOKS/INCIDENT_RESPONSE.md)
- [API Documentation](../../packages/api/README.md)