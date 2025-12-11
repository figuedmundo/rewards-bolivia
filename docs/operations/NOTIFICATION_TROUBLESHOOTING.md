# Point Expiration Notification System - Troubleshooting Guide

Comprehensive troubleshooting guide for common issues with the Point Expiration Notification system.

## Quick Reference

| Symptom | Likely Cause | Solution |
|---------|------------|----------|
| Emails not sending | AWS SES not configured | Check credentials and rate limit |
| Job not running | Cron not scheduled | Verify ScheduleModule imported |
| Duplicate notifications | Deduplication failed | Check NotificationLog indexes |
| User opt-out not working | Field not updated | Verify User.emailNotifications column |
| Email content wrong | Template variable issue | Check template rendering |
| No logs in NotificationLog | Job didn't run | Check scheduled job execution |

---

## Common Issues and Solutions

### 1. Emails Not Sending

**Symptoms:**
- User doesn't receive expected email
- NotificationLog shows FAILED status
- Error in application logs

#### Diagnosis Steps

1. Check application logs:
   ```bash
   tail -f logs/api.log | grep -i "email\|ses\|notification"
   ```

2. Query NotificationLog for failures:
   ```sql
   SELECT * FROM "NotificationLog"
   WHERE status = 'FAILED'
   ORDER BY createdAt DESC LIMIT 10;
   ```

3. Check failure reason:
   ```sql
   SELECT userId, failureReason, createdAt
   FROM "NotificationLog"
   WHERE status = 'FAILED'
   GROUP BY failureReason
   ORDER BY createdAt DESC;
   ```

#### Common Causes and Solutions

**Cause: AWS SES Credentials Invalid**

```bash
# Check credentials in environment
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY

# Verify credentials work
aws ses send-email \
  --from notifications@rewards-bolivia.com \
  --to test@example.com \
  --subject "Test" \
  --text "Test email" \
  --region us-east-1

# If error, refresh credentials from AWS Console
# IAM > Users > Security Credentials > Create new access key
```

**Cause: Sender Email Not Verified in AWS SES**

```bash
# Check verified identities
aws ses list-verified-email-addresses

# If notifications@rewards-bolivia.com not in list:
# 1. Go to AWS SES Console
# 2. Verified Identities
# 3. Create Identity
# 4. Enter email address
# 5. Verify email (check inbox for verification link)
```

**Cause: AWS SES Rate Limit Exceeded**

```bash
# Check environment variable
echo $NOTIFICATION_RATE_LIMIT

# Check AWS SES sending quota
aws ses get-account-sending-enabled

# Reduce rate limit if approaching quota
# Edit .env: NOTIFICATION_RATE_LIMIT=7 (instead of 14)

# Check CloudWatch for SES metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Send \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

**Cause: Sender Email Not in Production Mode (Sandbox)**

If in AWS SES Sandbox mode:
- Can only send to verified recipient email addresses
- Limit is 1 email/second (not 14)

```bash
# Check SES mode
aws ses get-account-sending-enabled

# Add test email addresses to verified recipients
aws ses verify-email-identity --email-address test@example.com

# For production: request to move out of sandbox
# AWS SES Console > Sending limits > Request production access
```

**Cause: Email Address Invalid**

```bash
# Check error reason in logs
# "invalid email format" = validation failed

# Check email validation logic
grep -r "isValidEmail" packages/api/src/modules/notifications/

# Test validation
node -e "
const email = 'test@example.com';
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log('Valid:', regex.test(email));
"
```

**Cause: User Email Missing**

```sql
-- Check users with missing email
SELECT id, email FROM "User" WHERE email IS NULL OR email = '';

-- Update users with missing email
UPDATE "User" SET email = 'noemail@rewards-bolivia.com' WHERE email IS NULL;
```

---

### 2. Scheduled Job Not Running

**Symptoms:**
- Job doesn't execute at scheduled time
- No "Starting point expiration notification job" in logs
- NotificationLog remains empty

#### Diagnosis Steps

1. Check if job is registered:
   ```bash
   grep -r "CheckExpiringPointsJob" packages/api/src/
   ```

2. Check if ScheduleModule is imported:
   ```bash
   grep -r "ScheduleModule" packages/api/src/modules/notifications/
   ```

3. Check application logs for cron initialization:
   ```bash
   tail -f logs/api.log | grep -i "cron\|schedule"
   ```

4. Wait for scheduled time or manually test:
   ```typescript
   // In test file
   const job = new CheckExpiringPointsJob(...);
   await job.handleCron();
   ```

#### Common Causes and Solutions

**Cause: ScheduleModule Not Imported**

```typescript
// notifications.module.ts should have:
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),  // REQUIRED
    EventEmitterModule.forRoot(),
  ],
})
export class NotificationsModule {}
```

**Cause: NotificationsModule Not Registered in AppModule**

```typescript
// app.module.ts should have:
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,  // REQUIRED
    // ... other modules
  ],
})
export class AppModule {}
```

**Cause: Cron Expression Invalid**

```bash
# Check cron expression
echo $NOTIFICATION_CRON_SCHEDULE

# Test cron expression format
# Format: "second minute hour day-of-month month day-of-week"
# Valid examples:
#   "0 9 * * *"     = 9 AM UTC daily
#   "0 2 * * *"     = 2 AM UTC daily
#   "0 */4 * * *"   = Every 4 hours

# Invalid examples (will not work):
#   "0 9"           = Missing fields
#   "9 * * *"       = Missing second field
#   "0 25 * * *"    = Hour 25 (invalid, max 23)
```

**Cause: Application Not Running**

```bash
# Check if API is running
curl http://localhost:3001/health

# Start API if not running
pnpm --filter api start:dev

# Check for startup errors
# If NotificationsModule fails to load, see error in console
```

**Cause: Timezone Issue**

```bash
# Job runs at 9 AM UTC regardless of server timezone
# If you need different timezone, change NOTIFICATION_CRON_SCHEDULE

# Check server timezone
date +%Z

# Change to UTC (if needed)
export TZ=UTC
```

---

### 3. Duplicate Notifications Sent

**Symptoms:**
- Same user receives multiple emails for same expiration date
- NotificationLog shows multiple SENT entries with identical user/type/date
- Users complaining about duplicate emails

#### Diagnosis Steps

1. Query for duplicate entries:
   ```sql
   SELECT userId, notificationType, expirationDate, COUNT(*) as count
   FROM "NotificationLog"
   WHERE status = 'SENT'
   GROUP BY userId, notificationType, expirationDate
   HAVING COUNT(*) > 1
   ORDER BY count DESC;
   ```

2. Check deduplication logic:
   ```bash
   grep -r "findExistingNotification" packages/api/src/modules/notifications/
   ```

3. Verify index exists:
   ```sql
   SELECT indexname FROM pg_indexes
   WHERE tablename = 'NotificationLog'
   AND indexname LIKE '%userId%';
   ```

#### Common Causes and Solutions

**Cause: Deduplication Index Missing**

```sql
-- Check if index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'NotificationLog'
AND indexname = 'NotificationLog_userId_notificationType_expirationDate_idx';

-- If missing, create it:
CREATE INDEX "NotificationLog_userId_notificationType_expirationDate_idx"
ON "NotificationLog"("userId", "notificationType", "expirationDate");
```

**Cause: Job Ran Multiple Times**

```bash
# Check how many times job ran
grep "Starting point expiration notification job" logs/api.log | wc -l

# If more than once:
# 1. Verify NOTIFICATION_CRON_SCHEDULE doesn't have errors
# 2. Check if application restarted unexpectedly
# 3. Review logs for restarts
```

**Cause: Deduplication Check Failed**

```typescript
// Check ExpirationNotificationService.processNotifications()
// Should have:

const existing = await this.notificationRepository.findExistingNotification(
  userId,
  notificationType,
  expirationDate,
);

if (existing) {
  // Skip sending - already sent
}
```

**Cause: Database Transaction Not Atomic**

```typescript
// Deduplication and insertion should be atomic
// Check PrismaNotificationRepository.createLog() uses transaction:

const result = await this.prisma.$transaction(async (tx) => {
  const existing = await tx.notificationLog.findFirst({ ... });
  if (!existing) {
    return await tx.notificationLog.create({ ... });
  }
});
```

**Solution: Clean Up Duplicates**

```sql
-- Find and delete duplicate entries (keep first one)
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY userId, notificationType, expirationDate
    ORDER BY createdAt ASC
  ) as rn
  FROM "NotificationLog"
  WHERE status = 'SENT'
)
DELETE FROM "NotificationLog"
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
```

---

### 4. User Opt-Out Not Working

**Symptoms:**
- User sets emailNotifications = false
- User still receives emails
- Preference toggle doesn't persist

#### Diagnosis Steps

1. Check User model has field:
   ```sql
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'User' AND column_name = 'emailNotifications';
   ```

2. Check user's preference:
   ```sql
   SELECT id, emailNotifications FROM "User" WHERE id = 'user-id';
   ```

3. Check API endpoint:
   ```bash
   curl -X GET http://localhost:3001/api/users/me/preferences \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. Check notification processing logic:
   ```bash
   grep -r "emailNotifications" packages/api/src/modules/
   ```

#### Common Causes and Solutions

**Cause: User Field Not Migrated**

```sql
-- Check if field exists
SELECT emailNotifications FROM "User" LIMIT 1;

-- If error "column does not exist":
-- Run migration:
pnpm --filter api exec prisma migrate deploy

-- Or add field manually:
ALTER TABLE "User" ADD COLUMN "emailNotifications" BOOLEAN NOT NULL DEFAULT true;
```

**Cause: API Not Checking Preference**

```typescript
// ExpirationNotificationService should check:

const user = await this.prisma.user.findUnique({
  where: { id: userId },
  select: { emailNotifications: true },
});

if (!user?.emailNotifications) {
  // Log as SKIPPED
  return; // Don't send email
}
```

**Cause: Preference Update Not Persisting**

```bash
# Test preference update
curl -X PATCH http://localhost:3001/api/users/me/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"emailNotifications": false}'

# Check if update succeeded
curl -X GET http://localhost:3001/api/users/me/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Cause: Cache Issue**

```typescript
// If using caching, ensure preference changes invalidate cache:
// After updating user, clear cache entry:

await this.cacheService.del(`user:${userId}:preferences`);
```

**Solution: Manually Update User Preference**

```sql
-- Set user opt-out
UPDATE "User" SET emailNotifications = false WHERE id = 'user-id';

-- Verify
SELECT emailNotifications FROM "User" WHERE id = 'user-id';
```

---

### 5. Email Content Incorrect

**Symptoms:**
- Variables not substituted (shows {{userName}} in email)
- Wrong data in email (wrong points, date, etc.)
- Missing sections (footer, CTA button)

#### Diagnosis Steps

1. Check template file exists:
   ```bash
   ls -la packages/api/src/modules/notifications/infrastructure/templates/
   ```

2. Test template rendering:
   ```typescript
   const { html, text } = await notificationBuilderService.renderEmailContent(
     'expiration-30-days',
     {
       userName: 'Test',
       pointsExpiring: 500,
       expirationDate: 'Dec 18',
       currentBalance: 1000,
       daysRemaining: 30,
       walletUrl: 'http://localhost:5173/wallet',
     },
   );
   console.log(html);
   ```

3. Check for template errors in logs:
   ```bash
   grep -i "template\|handlebars\|render" logs/api.log
   ```

#### Common Causes and Solutions

**Cause: Template File Missing**

```bash
# Check all template files exist
ls -la packages/api/src/modules/notifications/infrastructure/templates/

# Should have:
# expiration-30-days.hbs
# expiration-30-days.txt
# expiration-7-days.hbs
# expiration-7-days.txt
# expiration-1-day.hbs
# expiration-1-day.txt

# If missing, create from backup or examples
```

**Cause: Template Variable Wrong Name**

```handlebars
<!-- WRONG: -->
{{userName}}      <!-- correct -->
{{user_name}}     <!-- wrong -->
{{user}}          <!-- wrong -->

<!-- CORRECT: Must match exactly what's passed -->
{{userName}}
{{pointsExpiring}}
{{expirationDate}}
{{currentBalance}}
{{daysRemaining}}
{{walletUrl}}
```

**Cause: Template Syntax Error**

```handlebars
<!-- WRONG: -->
{{#if userName}}   <!-- missing /if -->
Hello {{userName}}

<!-- CORRECT: -->
{{#if userName}}
Hello {{userName}}
{{/if}}

<!-- Common errors: -->
{{#each items}}    <!-- missing /each -->
{{variable}        <!-- missing } -->
```

**Cause: Variable Not Passed to Template**

```typescript
// NotificationBuilderService must receive all variables:
const result = await notificationBuilderService.renderEmailContent(
  'expiration-30-days',
  {
    // ALL of these required:
    userName: user.firstName || user.email,
    pointsExpiring: expiringPoints.pointsExpiring,
    expirationDate: expiringPoints.expirationDate.toLocaleDateString(),
    currentBalance: userBalance,
    daysRemaining: expiringPoints.daysRemaining,
    walletUrl: process.env.FRONTEND_WALLET_URL,
  },
);
```

**Cause: Data Type Wrong**

```typescript
// Variables must be correct type:
{
  userName: 'John Doe',                    // string (not object)
  pointsExpiring: 500,                     // number (not string)
  expirationDate: '2025-12-18',            // formatted string
  currentBalance: 1000,                    // number
  daysRemaining: 30,                       // number
  walletUrl: 'https://...',                // URL string
}
```

**Solution: Test Template Rendering**

```bash
# Create test file: test-template.ts
import { NotificationBuilderService } from './application/services/notification-builder.service';

const service = new NotificationBuilderService();

(async () => {
  const { html, text } = await service.renderEmailContent('expiration-30-days', {
    userName: 'Test User',
    pointsExpiring: 500,
    expirationDate: 'December 18, 2025',
    currentBalance: 1250,
    daysRemaining: 30,
    walletUrl: 'http://localhost:5173/wallet',
  });

  console.log('HTML Output:');
  console.log(html);
  console.log('\nText Output:');
  console.log(text);
})();

# Run: npx ts-node test-template.ts
```

---

### 6. NotificationLog Empty

**Symptoms:**
- No entries in NotificationLog table
- Job ran but no logs created
- Can't check notification history

#### Diagnosis Steps

1. Check if table exists:
   ```sql
   SELECT COUNT(*) FROM "NotificationLog";
   ```

2. Check if job is running:
   ```bash
   tail -f logs/api.log | grep "CheckExpiringPointsJob"
   ```

3. Check if points exist to notify:
   ```sql
   SELECT COUNT(*) FROM "PointLedger"
   WHERE expiresAt BETWEEN now() AND (now() + interval '30 days');
   ```

#### Common Causes and Solutions

**Cause: Job Never Ran**

See "Scheduled Job Not Running" section above.

**Cause: No Points Expiring**

```sql
-- Check if there are any points with expiresAt
SELECT COUNT(*) FROM "PointLedger" WHERE expiresAt IS NOT NULL;

-- Check if any in next 30 days
SELECT COUNT(*) FROM "PointLedger"
WHERE expiresAt BETWEEN now() AND (now() + interval '30 days');

-- Create test data
INSERT INTO "PointLedger" (id, accountId, credit, expiresAt)
VALUES (uuid_generate_v4(), 'user-id', 100, now() + interval '5 days');
```

**Cause: Database Transaction Failed**

```typescript
// Check createLog() in PrismaNotificationRepository
// Should properly handle errors:

try {
  return await this.prisma.notificationLog.create({ data });
} catch (error) {
  this.logger.error('Failed to create log', error);
  throw error; // Re-throw to notify caller
}
```

**Cause: Foreign Key Constraint Violation**

```sql
-- Check if user exists
SELECT COUNT(*) FROM "User" WHERE id = 'user-id';

-- If not, notifications for that user won't be logged
-- Solution: Ensure all user IDs are valid before sending notifications
```

---

## Debugging Techniques

### Enable Verbose Logging

```bash
# Edit .env
DEBUG=*

# Or for specific module
DEBUG=rewards-bolivia:notifications:*

# Restart application
pnpm --filter api start:dev
```

### Database Queries

```sql
-- Recent notifications (last 24 hours)
SELECT * FROM "NotificationLog"
WHERE createdAt > now() - interval '24 hours'
ORDER BY createdAt DESC;

-- Failed notifications
SELECT userId, failureReason, COUNT(*) as count
FROM "NotificationLog"
WHERE status = 'FAILED'
GROUP BY userId, failureReason;

-- Notifications by status
SELECT status, COUNT(*) as count, AVG(EXTRACT(EPOCH FROM (sentAt - createdAt))) as avg_time_to_send
FROM "NotificationLog"
WHERE createdAt > now() - interval '7 days'
GROUP BY status;

-- User preferences
SELECT emailNotifications, COUNT(*) as user_count
FROM "User"
GROUP BY emailNotifications;
```

### Log Queries

```bash
# Find relevant logs
grep -i "notification" logs/api.log

# Filter by level
grep "ERROR.*notification" logs/api.log
grep "WARN.*notification" logs/api.log

# With timestamps
tail -f logs/api.log | grep "notification"

# Count occurrences
grep "notification" logs/api.log | wc -l
```

### Manual Job Execution

```typescript
// test-manual-job.ts
import { CheckExpiringPointsJob } from './src/modules/notifications/application/jobs/check-expiring-points.job';

const job = new CheckExpiringPointsJob(expirationNotificationService);

// Run job manually
await job.handleCron();

console.log('Job completed');
```

```bash
# Run test
npx ts-node test-manual-job.ts
```

---

## Performance Issues

### Slow Notification Queries

**Symptom:** Job takes >10 minutes to complete

**Solutions:**
1. Check index usage:
   ```sql
   SELECT * FROM pg_stat_user_indexes
   WHERE tablename IN ('PointLedger', 'NotificationLog');
   ```

2. Analyze query plan:
   ```sql
   EXPLAIN ANALYZE
   SELECT userId, SUM(credit) FROM "PointLedger"
   WHERE expiresAt BETWEEN now() AND (now() + interval '30 days')
   AND credit > 0
   GROUP BY userId;
   ```

3. Reduce batch size:
   ```bash
   # Edit .env
   NOTIFICATION_BATCH_SIZE=50  # Reduced from 100
   ```

4. Increase rate limit (if not hitting quota):
   ```bash
   # Edit .env
   NOTIFICATION_RATE_LIMIT=7   # Reduced from 14 to reduce memory usage
   ```

### High Memory Usage

**Symptom:** Application uses excessive memory during job execution

**Solutions:**
1. Reduce batch size:
   ```bash
   NOTIFICATION_BATCH_SIZE=50
   ```

2. Clear caches during job:
   ```typescript
   // Force garbage collection between batches
   if (global.gc) {
     global.gc();
   }
   ```

3. Use streaming instead of loading all data at once

---

## Contact and Escalation

For issues not covered in this guide:

1. Check [Notification Module README](../../packages/api/src/modules/notifications/README.md)
2. Review application logs comprehensively
3. Check AWS SES logs in CloudWatch
4. Contact support team: [support@rewards-bolivia.com](mailto:support@rewards-bolivia.com)
5. Document issue for post-mortem analysis

---

## Known Issues and Workarounds

**Issue:** AWS SES moves email to spam folder
- **Cause:** SPF/DKIM/DMARC not configured
- **Workaround:** Configure DNS records in AWS SES documentation

**Issue:** Notifications not sent in sandbox mode
- **Cause:** Recipient email not verified
- **Workaround:** Add recipient to verified email list in AWS SES Console

**Issue:** Job hangs and doesn't complete
- **Cause:** Database connection timeout or deadlock
- **Workaround:** Increase connection timeout, reduce batch size

---

## Related Documentation

- [Notification Module README](../../packages/api/src/modules/notifications/README.md)
- [API Endpoints](./NOTIFICATION_ENDPOINTS.md)
- [Environment Variables](../../.env.example)
- [Database Migrations](../database/NOTIFICATION_MIGRATIONS.md)
- [Deployment Checklist](./NOTIFICATION_DEPLOYMENT_CHECKLIST.md)
