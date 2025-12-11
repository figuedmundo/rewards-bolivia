# Point Expiration Notification System - Monitoring & Alerting Guide

Comprehensive guide for monitoring the health and performance of the Point Expiration Notification system in production.

## Overview

This guide covers:
- Key metrics to monitor
- Alert thresholds and conditions
- Dashboard setup recommendations
- Integration with existing monitoring systems
- Operational dashboards for different stakeholders
- Health check procedures

## Key Metrics to Monitor

### 1. Notification Delivery Metrics

#### Emails Sent

**Query:**
```sql
SELECT
  DATE_TRUNC('day', createdAt) as day,
  COUNT(*) as total,
  COUNTIF(status = 'SENT') as sent,
  COUNTIF(status = 'FAILED') as failed,
  COUNTIF(status = 'SKIPPED') as skipped
FROM "NotificationLog"
GROUP BY day
ORDER BY day DESC;
```

**Metrics:**
- `notification.sent_count_daily` - Number of emails sent per day
- `notification.failed_count_daily` - Number of failed emails per day
- `notification.skipped_count_daily` - Number of skipped notifications per day
- `notification.delivery_rate` - Percentage of sent / (sent + failed)

**Healthy Range:**
- Delivery rate: >95%
- Failed count: <5% of sent
- Skipped count: <10% of total (mostly user opt-outs)

**Example Dashboard Query (Prometheus):**
```prometheus
rate(notification_sent_count[1d])
rate(notification_failed_count[1d])
(notification_sent_count / (notification_sent_count + notification_failed_count))
```

#### Failure Reasons Distribution

**Query:**
```sql
SELECT
  failureReason,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM "NotificationLog"
WHERE status = 'FAILED'
  AND createdAt > now() - interval '7 days'
GROUP BY failureReason
ORDER BY count DESC;
```

**Metrics:**
- `notification.failure_reason.missing_email` - Users with no email address
- `notification.failure_reason.invalid_format` - Invalid email addresses
- `notification.failure_reason.ses_error` - AWS SES errors
- `notification.failure_reason.user_opted_out` - User opted out

**Healthy Range:**
- Missing email: <1% of failures
- Invalid format: <1% of failures
- SES errors: <5% of failures
- User opted out: Should be logged as SKIPPED not FAILED

#### Notifications by Type

**Query:**
```sql
SELECT
  notificationType,
  COUNT(*) as count,
  COUNTIF(status = 'SENT') as sent
FROM "NotificationLog"
WHERE createdAt > now() - interval '1 day'
GROUP BY notificationType;
```

**Expected Distribution (approximate):**
- 30-day notifications: 50-60% of total
- 7-day notifications: 30-40% of total
- 1-day notifications: 10-20% of total

**Anomaly Detection:**
- If 30-day notifications are <30% or >80%, may indicate data issues
- If 1-day notifications are 0%, may indicate point data issue

### 2. Job Execution Metrics

#### Job Execution Time

**Query:**
```bash
grep "Job completed successfully in" logs/api.log | tail -10
```

**Metrics:**
- `notification.job_execution_time` - Duration of CheckExpiringPointsJob
- `notification.job_execution_time_30day` - Time for 30-day window processing
- `notification.job_execution_time_7day` - Time for 7-day window processing
- `notification.job_execution_time_1day` - Time for 1-day window processing

**Healthy Range:**
- Total job: <10 minutes
- Each window: <4 minutes
- Average per window: <3 minutes

**Alert Threshold:**
- Job time >12 minutes (20% over target)

**Example Metric Collection:**
```typescript
// In CheckExpiringPointsJob
const startTime = Date.now();
const result = await this.expirationNotificationService.processNotifications(...);
const executionTime = Date.now() - startTime;

this.logger.info('Job completed', {
  executionTime,
  processed: result.processed,
  sent: result.sent,
  failed: result.failed,
});

// Emit to monitoring system
metrics.gauge('notification.job_execution_time', executionTime);
```

#### Job Execution Frequency

**Query:**
```bash
grep "Starting point expiration notification job" logs/api.log | wc -l
```

**Metrics:**
- `notification.job_runs_daily` - Number of times job ran today
- `notification.job_last_execution` - Timestamp of last execution

**Healthy Range:**
- Job runs exactly once per day
- Last execution within 1 hour of scheduled time

**Alert Threshold:**
- Job runs more than once per day (duplicate execution)
- Last execution >24 hours ago (job missed)

#### Job Status

**Query:**
```bash
grep -E "(Starting|successfully|error)" logs/api.log | grep "CheckExpiringPointsJob" | tail -5
```

**Metrics:**
- `notification.job_success_count` - Number of successful executions
- `notification.job_failure_count` - Number of failed executions
- `notification.job_success_rate` - Percentage of successful executions

**Healthy Range:**
- Success rate: 100% (or >99%)
- Failure count: 0 (or <1 per month)

**Alert Threshold:**
- Any job failure (should be 0)
- Success rate drops below 95%

### 3. AWS SES Metrics

#### SES Bounce Rate

**AWS CloudWatch Query:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Bounce \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 86400 \
  --statistics Sum,Average
```

**Metrics:**
- `aws.ses.bounce_count` - Total bounces
- `aws.ses.bounce_rate` - Percentage of emails bounced

**Healthy Range:**
- Bounce rate: <2% (AWS threshold)
- Hard bounces: 0 (indicates invalid email list)

**Alert Threshold:**
- Bounce rate >2%
- Hard bounce rate >0.5%

#### SES Complaint Rate

**AWS CloudWatch Query:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Complaint \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 86400 \
  --statistics Sum
```

**Metrics:**
- `aws.ses.complaint_count` - Total complaints
- `aws.ses.complaint_rate` - Percentage of emails with complaints

**Healthy Range:**
- Complaint rate: <0.5% (AWS threshold)
- Complaint count: <5 per day (for typical usage)

**Alert Threshold:**
- Complaint rate >0.5%
- Complaint count >10 per day

#### SES Send Rate

**AWS CloudWatch Query:**
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Send \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

**Metrics:**
- `aws.ses.send_count` - Total emails sent
- `aws.ses.send_rate` - Emails per second

**Healthy Range:**
- Send rate: 1-14 emails/second (depends on configuration)
- No throttling errors

**Alert Threshold:**
- Send rate approaches quota limit (85%+)
- Throttling errors from AWS

#### SES Quota Usage

**AWS SES Console Query:**
```bash
aws ses get-account-sending-enabled
# Check quota vs usage in console
```

**Metrics:**
- `aws.ses.quota_24h` - 24-hour sending limit
- `aws.ses.quota_rate` - Rate limit (emails/second)
- `aws.ses.usage_24h` - Current 24-hour usage
- `aws.ses.usage_rate` - Current rate (emails/second)

**Healthy Range:**
- 24-hour usage: <80% of quota
- Rate usage: <80% of limit

**Alert Threshold:**
- 24-hour usage >90% of quota
- Rate usage >95% of limit
- Any quota exceeded error

### 4. Database Performance Metrics

#### PointLedger Query Performance

**Query:**
```sql
EXPLAIN ANALYZE
SELECT userId, SUM(credit)
FROM "PointLedger"
WHERE expiresAt BETWEEN now() AND (now() + interval '30 days')
  AND credit > 0
GROUP BY userId;
```

**Metrics:**
- `database.query.point_ledger_expiring.duration` - Query execution time
- `database.query.point_ledger_expiring.rows_scanned` - Rows evaluated

**Healthy Range:**
- Query time: <2 seconds
- Index usage: Must use index on expiresAt, credit

**Alert Threshold:**
- Query time >5 seconds
- Falling back to full table scan

#### NotificationLog Index Usage

**Query:**
```sql
SELECT indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'NotificationLog';
```

**Metrics:**
- `database.index.notification_log.scan_count` - Number of index scans
- `database.index.notification_log.tuple_read` - Tuples read from index

**Healthy Range:**
- Scan count: >10 per day (indicates regular usage)
- Index efficiency: Low tuple-to-row ratio

**Alert Threshold:**
- Index not being used (scan count = 0 over 24 hours)
- Deduplication queries reverting to full table scan

#### Deduplication Query Performance

**Query:**
```sql
EXPLAIN ANALYZE
SELECT id FROM "NotificationLog"
WHERE userId = 'test-user'
  AND notificationType = 'EXPIRATION_30_DAYS'
  AND expirationDate = '2025-12-18';
```

**Metrics:**
- `database.query.deduplication.duration` - Query execution time
- `database.query.deduplication.cache_hits` - Number of cache hits

**Healthy Range:**
- Query time: <100ms
- Using index (not full scan)

**Alert Threshold:**
- Query time >500ms
- Full table scan detected

#### NotificationLog Table Growth

**Query:**
```sql
SELECT COUNT(*) as record_count, pg_size_pretty(pg_total_relation_size('NotificationLog')) as size
FROM "NotificationLog";
```

**Metrics:**
- `database.table.notification_log.record_count` - Total records
- `database.table.notification_log.size_bytes` - Table storage size
- `database.table.notification_log.growth_rate` - Records added per day

**Healthy Range:**
- Growth rate: 1K-10K records per day (expected volume)
- Storage: <1GB (at scale)

**Alert Threshold:**
- Unexpected growth spike (>100K records per day)
- Storage approaching limits

### 5. Email Template Rendering Metrics

#### Template Rendering Time

**Metrics:**
- `notification.template_render_time` - Time to render template
- `notification.template_cache_hits` - Cache hit percentage

**Healthy Range:**
- Rendering time: <100ms per email
- Cache hit rate: >90%

**Alert Threshold:**
- Rendering time >500ms
- Cache hit rate <50%

#### Email Content Quality

**Manual Checks (monthly):**
- [ ] Send test email in production template
- [ ] Verify in Gmail, Outlook, Apple Mail
- [ ] Check variable substitution
- [ ] Verify links are clickable
- [ ] Check responsive design on mobile

## Alert Configuration

### Alert Severity Levels

**CRITICAL (Page immediately):**
- Job failure (any execution error)
- Delivery rate drops below 90%
- AWS SES suspension or quota exceeded
- Database connectivity issues

**HIGH (Alert within 1 hour):**
- Job execution time >12 minutes
- Bounce rate >2%
- Complaint rate >0.5%
- Deduplication not working (duplicate sends)

**MEDIUM (Alert during business hours):**
- Job execution time >8 minutes
- Email queue building up (not processing)
- Database slow query detected
- Template rendering issues

**LOW (Daily digest):**
- Failed notification count
- Skipped notification count (user opt-outs)
- Daily statistics summary

### Recommended Alert Rules

#### Alert: Job Execution Failure

```prometheus
# Trigger if job error log entries exist in last 24 hours
count(count_over_time(log_line{job="api", level="ERROR", msg=~"CheckExpiringPointsJob|notification.*error"}[24h])) > 0
```

**Action:**
1. Check application logs for error details
2. Verify database connectivity
3. Check AWS SES configuration
4. Review [Troubleshooting Guide](./NOTIFICATION_TROUBLESHOOTING.md)

#### Alert: Low Delivery Rate

```prometheus
# Trigger if delivery rate drops below 90%
(rate(notification_sent_count[24h]) / (rate(notification_sent_count[24h]) + rate(notification_failed_count[24h]))) < 0.90
```

**Action:**
1. Query NotificationLog for failure reasons
2. Check AWS SES bounce/complaint rates
3. Verify email addresses are valid
4. Review error logs for patterns

#### Alert: Job Execution Time Exceeded

```prometheus
# Trigger if job takes >12 minutes
max_over_time(notification_job_execution_time[5m]) > 720000  # 12 minutes in milliseconds
```

**Action:**
1. Check database query performance
2. Review job logs for which window is slow
3. Consider reducing batch size
4. Check database load

#### Alert: SES Bounce Rate High

```bash
aws cloudwatch set-alarm-state \
  --alarm-name ses-bounce-rate-high \
  --state-reason "Bounce rate exceeded threshold" \
  --state-value ALARM
```

**Action:**
1. Check CloudWatch for bounce metrics
2. Review NotificationLog for patterns (missing emails?)
3. Consider email validation
4. Investigate why bounce rate increasing

#### Alert: SES Quota Approaching

```prometheus
# Trigger if usage >85% of quota
(aws_ses_usage_24h / aws_ses_quota_24h) > 0.85
```

**Action:**
1. Monitor to see if this is sustainable
2. If approaching limit, request quota increase
3. Consider reducing notification frequency
4. Check for unexpected high volume

#### Alert: Duplicate Notifications

```sql
-- Alert if duplicates detected
SELECT COUNT(*)
FROM (
  SELECT userId, notificationType, expirationDate, COUNT(*) as count
  FROM "NotificationLog"
  WHERE status = 'SENT'
    AND createdAt > now() - interval '1 day'
  GROUP BY userId, notificationType, expirationDate
  HAVING COUNT(*) > 1
) duplicates;
-- Alert if count > 0
```

**Action:**
1. Stop the job immediately
2. Investigate deduplication logic
3. Check database indexes
4. Review logs for duplicate runs
5. See [Troubleshooting Guide](./NOTIFICATION_TROUBLESHOOTING.md)

## Dashboard Recommendations

### Operations Dashboard (For DevOps/SRE Team)

**Content:**
- Job execution time (last 24 hours)
- Delivery rate (last 7 days)
- Failed notifications by reason (last 24 hours)
- AWS SES quota usage
- Database query performance (PointLedger, deduplication)
- Error log excerpt
- Last job execution status and time

**Refresh Rate:** Real-time (5-minute updates)

**Tools:** Grafana, DataDog, New Relic

### Business Dashboard (For Product/Support Team)

**Content:**
- Daily notifications sent (last 30 days)
- User engagement metrics (views of emails, click-through rates if tracked)
- Delivery rate trend
- User opt-out rate
- Geographic distribution of notifications sent
- Top expiration dates (what's expiring most)

**Refresh Rate:** Daily

**Tools:** Tableau, Looker, or simple SQL queries

### Customer Support Dashboard

**Content:**
- User notification preferences (opt-in/opt-out counts)
- Last 24 hours notification summary
- Quick links to query NotificationLog by user ID
- Common issues documentation
- Error reason breakdown (to help with support tickets)

**Refresh Rate:** On-demand

**Tools:** Internal dashboard or admin panel

### Technical Monitoring Dashboard (For Development Team)

**Content:**
- Application logs (filtered for notification module)
- Database indexes status
- Cache hit rates
- Template rendering times
- API endpoint response times (if tracked)
- Test coverage percentage
- Code deployment history

**Refresh Rate:** Real-time

**Tools:** ELK Stack, Splunk, DataDog

## Operational Procedures

### Daily Health Check

Run this every morning to verify system health:

```bash
# 1. Check last job execution
tail -100 logs/api.log | grep "CheckExpiringPointsJob"

# 2. Check delivery rate
psql -U postgres -d rewardsdb -c "
SELECT
  DATE(createdAt) as day,
  COUNT(*) as total,
  SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END) as sent,
  ROUND(100.0*SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END)/COUNT(*), 2) as delivery_rate
FROM \"NotificationLog\"
WHERE DATE(createdAt) = CURRENT_DATE
GROUP BY DATE(createdAt);
"

# 3. Check for failed notifications
psql -U postgres -d rewardsdb -c "
SELECT failureReason, COUNT(*) as count
FROM \"NotificationLog\"
WHERE status='FAILED'
  AND DATE(createdAt)=CURRENT_DATE
GROUP BY failureReason;
"

# 4. Check AWS SES quota
aws ses get-account-sending-enabled

# 5. Check recent errors in logs
grep -i error logs/api.log | tail -20
```

### Weekly Health Review

Run this every Monday to assess week's health:

```bash
# 1. Job execution summary
psql -U postgres -d rewardsdb -c "
SELECT
  DATE_TRUNC('day', createdAt)::date as day,
  COUNT(*) as total,
  SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status='SKIPPED' THEN 1 ELSE 0 END) as skipped,
  ROUND(100.0*SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END)/COUNT(*), 2) as delivery_rate
FROM \"NotificationLog\"
WHERE createdAt > now() - interval '7 days'
GROUP BY DATE_TRUNC('day', createdAt)
ORDER BY day DESC;
"

# 2. Top failure reasons
psql -U postgres -d rewardsdb -c "
SELECT failureReason, COUNT(*) as count
FROM \"NotificationLog\"
WHERE status='FAILED'
  AND createdAt > now() - interval '7 days'
GROUP BY failureReason
ORDER BY count DESC;
"

# 3. Email opt-out trends
psql -U postgres -d rewardsdb -c "
SELECT
  emailNotifications,
  COUNT(*) as user_count,
  ROUND(100.0*COUNT(*)/(SELECT COUNT(*) FROM \"User\"), 2) as percentage
FROM \"User\"
GROUP BY emailNotifications;
"
```

### Monthly Performance Review

Review overall health and identify trends:

```bash
# 1. 30-day delivery metrics
psql -U postgres -d rewardsdb -c "
SELECT
  COUNT(*) as total_notifications,
  SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status='FAILED' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status='SKIPPED' THEN 1 ELSE 0 END) as skipped,
  ROUND(100.0*SUM(CASE WHEN status='SENT' THEN 1 ELSE 0 END)/COUNT(*), 2) as delivery_rate
FROM \"NotificationLog\"
WHERE createdAt > now() - interval '30 days';
"

# 2. Growth trends
psql -U postgres -d rewardsdb -c "
SELECT
  DATE_TRUNC('week', createdAt)::date as week,
  COUNT(*) as notifications_sent
FROM \"NotificationLog\"
WHERE status='SENT'
  AND createdAt > now() - interval '90 days'
GROUP BY DATE_TRUNC('week', createdAt)
ORDER BY week DESC;
"

# 3. Database growth
psql -U postgres -d rewardsdb -c "
SELECT
  (SELECT COUNT(*) FROM \"NotificationLog\") as total_log_entries,
  ROUND((SELECT pg_size_pretty(pg_total_relation_size('NotificationLog')))::numeric) as table_size,
  (SELECT COUNT(*) FROM \"User\") as total_users,
  ROUND(100.0*(SELECT COUNT(*) FROM \"User\" WHERE emailNotifications=true)/(SELECT COUNT(*) FROM \"User\"), 2) as opt_in_rate
FROM pg_stat_user_tables WHERE relname='NotificationLog';
"
```

## Scaling Considerations

### When to Scale Up

Increase resources when:

- Job execution time approaches 10 minutes
- Query performance degrades >2x from baseline
- Database CPU >70% during job execution
- Memory usage >80% during job execution

**Scaling Actions:**

1. **Reduce Batch Size:**
   ```bash
   NOTIFICATION_BATCH_SIZE=50  # from 100
   ```

2. **Increase Database Resources:**
   - Add more CPU to database server
   - Increase RAM for better caching
   - Use read replica for large queries

3. **Add Database Indexes:**
   ```sql
   CREATE INDEX CONCURRENTLY "PointLedger_accountId_expiresAt_idx"
   ON "PointLedger"("accountId", "expiresAt");
   ```

4. **Optimize Queries:**
   - Add date partitioning to large tables
   - Archive old NotificationLog entries

### Archive Strategy

For long-term storage, consider archiving old NotificationLog entries:

```sql
-- Archive entries older than 1 year
INSERT INTO notification_log_archive
SELECT * FROM "NotificationLog"
WHERE createdAt < now() - interval '1 year';

DELETE FROM "NotificationLog"
WHERE createdAt < now() - interval '1 year';
```

## Integration with Existing Systems

### Datadog Integration

```python
# Send metrics to Datadog
from datadog import api, initialize

initialize(api_key='YOUR_API_KEY', app_key='YOUR_APP_KEY')

api.Metric.send(
  metric='notification.sent_count',
  points=[(timestamp, count)],
  tags=['environment:production', 'service:notification']
)
```

### PagerDuty Integration

```bash
# Alert on job failure
curl -X POST https://events.pagerduty.com/v2/enqueue \
  -H 'Content-Type: application/json' \
  -d '{
    "routing_key": "YOUR_ROUTING_KEY",
    "event_action": "trigger",
    "payload": {
      "summary": "Point Expiration Notification Job Failed",
      "severity": "critical",
      "source": "notification-system"
    }
  }'
```

### Slack Integration

```bash
# Send daily summary to Slack
curl -X POST YOUR_SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "Daily Notification Summary",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*Emails Sent:* 12,345\n*Delivery Rate:* 98.5%\n*Failed:* 182"
        }
      }
    ]
  }'
```

## References

- [Notification Module README](../../packages/api/src/modules/notifications/README.md)
- [AWS SES Monitoring](https://docs.aws.amazon.com/ses/latest/dg/monitoring-cloudwatch.html)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/data_model/)
- [Grafana Dashboard](https://grafana.com/docs/grafana/latest/dashboards/)

## Support

For monitoring questions or to add new metrics:

1. Review this guide
2. Check existing monitoring setup
3. Add metric to appropriate dashboard
4. Document in this guide
5. Test alert thresholds in staging
