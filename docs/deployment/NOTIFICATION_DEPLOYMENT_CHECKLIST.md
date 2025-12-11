# Point Expiration Notification System - Deployment Checklist

This checklist ensures all components of the Point Expiration Notification system are properly configured and working before production deployment.

## Pre-Deployment Phase

Complete this phase 1-2 weeks before the scheduled deployment date.

### Environment Configuration

- [ ] **AWS SES Account Setup**
  - [ ] AWS SES account created and accessible
  - [ ] SES region configured: `AWS_SES_REGION=us-east-1` (or appropriate region)
  - [ ] IAM user created with SES permissions
  - [ ] IAM credentials obtained: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
  - [ ] Credentials stored securely (AWS Secrets Manager, Vault, etc.)
  - [ ] Credentials NOT committed to version control
  - [ ] Reference: [AWS SES Setup Guide](https://docs.aws.amazon.com/ses/)

- [ ] **AWS SES Domain Verification** (for production)
  - [ ] Domain registered and accessible
  - [ ] DNS records added for domain verification:
    - [ ] DKIM records added to DNS
    - [ ] SPF record added to DNS
    - [ ] DMARC record configured (optional but recommended)
  - [ ] Domain verified in AWS SES Console
  - [ ] Sender email address verified: `notifications@rewards-bolivia.com` (or your domain)
  - [ ] Email address appears in "Verified identities" in SES Console
  - [ ] For sandbox mode (dev/staging): verified recipient email addresses added

- [ ] **AWS SES Sending Quota Configuration**
  - [ ] Checked current sending quota (24-hour limit)
  - [ ] Checked sending rate limit (emails per second)
  - [ ] Verified quota is sufficient for expected volume
  - [ ] If needed, submitted request to increase quota
  - [ ] For development/staging: kept in sandbox mode (1 email/sec, verified emails only)
  - [ ] For production: requested production mode access (if not already enabled)
  - [ ] Reference: AWS SES Console > Sending limits

- [ ] **Environment Variables Configured**
  - [ ] `AWS_SES_REGION` set correctly
  - [ ] `AWS_ACCESS_KEY_ID` set with IAM user key
  - [ ] `AWS_SECRET_ACCESS_KEY` set with IAM secret
  - [ ] `AWS_SES_FROM_EMAIL` set to verified sender email
  - [ ] `NOTIFICATION_CRON_SCHEDULE` set to desired time: `"0 9 * * *"` (or custom)
  - [ ] `NOTIFICATION_BATCH_SIZE` set appropriately: `100` (or custom)
  - [ ] `NOTIFICATION_RATE_LIMIT` set to match SES quota: `14` (or custom)
  - [ ] `FRONTEND_WALLET_URL` set to correct frontend URL
  - [ ] All variables tested in staging environment
  - [ ] Verified credentials work with test email send

### Database Preparation

- [ ] **Database Backup Completed**
  - [ ] Full database backup created
  - [ ] Backup tested and verified restorable
  - [ ] Backup stored in secure location
  - [ ] Backup metadata documented (date, size, location)

- [ ] **Migration Scripts Reviewed**
  - [ ] Migration file reviewed for correctness
  - [ ] SQL operations validated
  - [ ] Rollback procedure documented
  - [ ] Migration tested on staging database
  - [ ] Performance impact assessed

- [ ] **Migration Executed on Staging**
  - [ ] Staging database migrated successfully
  - [ ] NotificationLog table created
  - [ ] User.emailNotifications field added
  - [ ] PointLedger indexes created
  - [ ] Migration executed without errors
  - [ ] Data integrity verified

### Application Code Readiness

- [ ] **Code Review Completed**
  - [ ] All notification module code reviewed
  - [ ] Architecture follows DDD patterns
  - [ ] Error handling implemented
  - [ ] Logging implemented
  - [ ] AWS SES mocking in tests verified
  - [ ] No real AWS SES calls in test code

- [ ] **Tests Pass on Staging**
  - [ ] Run: `pnpm test notifications` on staging
  - [ ] All unit tests passing
  - [ ] All integration tests passing
  - [ ] Test coverage verified: 70%+ overall, 90%+ critical
  - [ ] No failing tests
  - [ ] No warnings in test output

- [ ] **Documentation Reviewed**
  - [ ] Module README is accurate
  - [ ] API endpoint documentation is complete
  - [ ] Environment variable documentation is comprehensive
  - [ ] Template customization guide available
  - [ ] Database migration documentation complete
  - [ ] This checklist is understood
  - [ ] Troubleshooting guide reviewed

- [ ] **Build Verification**
  - [ ] Application builds without errors: `pnpm build`
  - [ ] No TypeScript compilation errors
  - [ ] No ESLint warnings in notification module
  - [ ] Docker image builds successfully (if using Docker)
  - [ ] All dependencies resolved correctly

### Email Template Validation

- [ ] **Templates Tested Locally**
  - [ ] All 6 templates render without errors
  - [ ] All template variables substitute correctly
  - [ ] HTML templates are properly formatted
  - [ ] Plain text templates are readable
  - [ ] No syntax errors in Handlebars templates

- [ ] **Email Client Compatibility Verified**
  - [ ] HTML emails tested in Gmail
  - [ ] HTML emails tested in Outlook
  - [ ] HTML emails tested in Apple Mail
  - [ ] Responsive design verified on mobile
  - [ ] Links are clickable and navigate correctly
  - [ ] Images load correctly (if used)
  - [ ] Email is not flagged as spam

- [ ] **Email Content Quality Reviewed**
  - [ ] Subject line is clear and professional
  - [ ] Greeting is personalized with user name
  - [ ] Point expiration date is clear
  - [ ] Call-to-action is prominent and actionable
  - [ ] Unsubscribe link is visible
  - [ ] Company branding is present
  - [ ] No sensitive information exposed
  - [ ] Copy is professional and error-free

### Staging Environment Testing

- [ ] **Full Notification Flow Tested**
  - [ ] Created test users with emailNotifications=true
  - [ ] Created PointLedger entries with expiresAt in next 30 days
  - [ ] Ran CheckExpiringPointsJob manually
  - [ ] Verified notifications were queued
  - [ ] Verified emails sent via AWS SES (staging)
  - [ ] Verified notification logs created in NotificationLog table
  - [ ] Verified email content renders correctly

- [ ] **User Preference API Tested**
  - [ ] PATCH /api/users/me/preferences endpoint works
  - [ ] GET /api/users/me/preferences endpoint works
  - [ ] Setting emailNotifications=false prevents emails
  - [ ] Setting emailNotifications=true allows emails
  - [ ] Preference changes persist after reload

- [ ] **Frontend Integration Tested**
  - [ ] Notification preferences UI loads
  - [ ] Checkbox reflects current preference
  - [ ] Toggling checkbox calls API correctly
  - [ ] Success/error messages display
  - [ ] API calls use correct authentication token

- [ ] **Error Scenarios Tested**
  - [ ] User with missing email - correctly logged as FAILED
  - [ ] User with invalid email - correctly logged as FAILED
  - [ ] User opted out - correctly logged as SKIPPED
  - [ ] AWS SES temporary error - retry logic works
  - [ ] Job failure - error logged and system recovers

### User Notification (Before Deployment)

- [ ] **User Communication Prepared**
  - [ ] Email drafted explaining new notification feature
  - [ ] Email explains what notifications user will receive
  - [ ] Email explains how to opt out
  - [ ] FAQ entry created about point expiration notifications
  - [ ] Help documentation updated
  - [ ] Support team trained on notification feature

- [ ] **Opt-Out Instructions Provided**
  - [ ] Clear instructions on where to find notification preferences
  - [ ] Screenshots showing where to disable notifications
  - [ ] Instructions in multiple formats (email, help doc, FAQ)
  - [ ] Link to settings page provided
  - [ ] Support email for assistance provided

---

## Deployment Phase

Execute this phase during the scheduled deployment window.

### Pre-Deployment Final Checks

- [ ] **Maintenance Window Scheduled**
  - [ ] Maintenance window scheduled and communicated
  - [ ] Low-traffic time selected (off-peak hours)
  - [ ] Team available to monitor deployment
  - [ ] Rollback plan prepared and accessible
  - [ ] Database backup completed within last 24 hours

- [ ] **Code Deployment Preparation**
  - [ ] Latest code merged to main branch
  - [ ] All changes committed and pushed
  - [ ] CI/CD pipeline passing all checks
  - [ ] No merge conflicts
  - [ ] Deployment script prepared and tested

### Deployment Execution

- [ ] **Database Migration**
  - [ ] Database backed up (create final backup)
  - [ ] Prisma migration executed: `pnpm --filter api exec prisma migrate deploy`
  - [ ] Migration completed without errors
  - [ ] NotificationLog table exists
  - [ ] User.emailNotifications field exists
  - [ ] PointLedger indexes created
  - [ ] Data integrity verified

- [ ] **Application Deployment**
  - [ ] New code deployed to production
  - [ ] Application starts without errors
  - [ ] No startup errors in logs
  - [ ] All modules loaded successfully
  - [ ] NotificationsModule registered
  - [ ] CheckExpiringPointsJob scheduled
  - [ ] Health check endpoint responding

- [ ] **Configuration Verification**
  - [ ] Environment variables correctly set
  - [ ] AWS credentials functional
  - [ ] Database connection working
  - [ ] Scheduled job showing in logs
  - [ ] EmailService initialized correctly

- [ ] **Test Email Sent**
  - [ ] Test email sent from production environment
  - [ ] Email received in test inbox
  - [ ] Email renders correctly
  - [ ] All variables substituted correctly
  - [ ] Links are clickable and navigate correctly

### Post-Deployment Verification

- [ ] **Application Health Check**
  - [ ] API responding to requests: `curl http://api/health`
  - [ ] Database accessible
  - [ ] No error spike in logs
  - [ ] Response times normal
  - [ ] Memory usage normal
  - [ ] CPU usage normal

- [ ] **Notification System Operational**
  - [ ] CheckExpiringPointsJob ran successfully (if within cron window)
  - [ ] No errors in job logs
  - [ ] NotificationLog table contains entries (if job ran)
  - [ ] NotificationPreferences API endpoints accessible
  - [ ] Preference updates working

- [ ] **Monitoring Configured**
  - [ ] Logs being collected properly
  - [ ] Error alerts configured
  - [ ] Email metrics being tracked
  - [ ] NotificationLog growth being monitored
  - [ ] AWS SES metrics accessible in CloudWatch

- [ ] **User-Facing Verification**
  - [ ] Notification preferences visible in user settings
  - [ ] Checkbox displays current preference
  - [ ] Toggling preference works
  - [ ] API response times acceptable
  - [ ] No UI errors in console

---

## Post-Deployment Phase

Complete this phase after deployment to production.

### First 24 Hours Monitoring

- [ ] **Scheduled Job Execution** (at next cron time)
  - [ ] CheckExpiringPointsJob executed successfully
  - [ ] Job logs show: "Starting point expiration notification job"
  - [ ] Job completed without errors
  - [ ] Summary statistics logged
  - [ ] NotificationLog populated with entries
  - [ ] Execution time acceptable (<10 minutes for expected volume)

- [ ] **Email Delivery Verification**
  - [ ] Emails successfully sent via AWS SES
  - [ ] Email content renders correctly
  - [ ] No bounce errors from AWS SES
  - [ ] No complaint errors from AWS SES
  - [ ] AWS SES sending quota not exceeded
  - [ ] Rate limiting working correctly

- [ ] **Error Monitoring**
  - [ ] No unexpected errors in logs
  - [ ] No database errors
  - [ ] No AWS SES authentication errors
  - [ ] No application crashes
  - [ ] Error rate normal

- [ ] **Database Health**
  - [ ] Database responsive
  - [ ] Query performance acceptable
  - [ ] Indexes being used by query planner
  - [ ] No slow queries
  - [ ] Disk space adequate

- [ ] **User Feedback Collection**
  - [ ] Monitor support email for complaints
  - [ ] Monitor social media for feedback
  - [ ] No spike in support tickets about notifications
  - [ ] Users receiving emails as expected
  - [ ] Users able to opt out successfully

### First Week Monitoring

- [ ] **Job Execution Consistency**
  - [ ] Job executes every day at scheduled time
  - [ ] No missed job executions
  - [ ] Execution times consistent
  - [ ] No job hangs or timeouts

- [ ] **Email Delivery Quality**
  - [ ] >95% of emails successfully sent
  - [ ] AWS SES bounce rate <2%
  - [ ] AWS SES complaint rate <0.5%
  - [ ] Email delivery times acceptable
  - [ ] No sending quota exceeded

- [ ] **Data Integrity**
  - [ ] NotificationLog entries created correctly
  - [ ] User preferences respected
  - [ ] Deduplication working (no duplicate emails)
  - [ ] Failed notifications logged with reasons
  - [ ] Skipped notifications logged with reasons

- [ ] **Performance Metrics**
  - [ ] PointLedger queries <2 seconds
  - [ ] Deduplication queries <100ms
  - [ ] Email processing <500ms per email
  - [ ] Job completes in <10 minutes
  - [ ] No performance degradation

- [ ] **User Experience**
  - [ ] Notification preferences page accessible
  - [ ] Preference changes take effect immediately
  - [ ] Users receiving/not receiving emails as preferred
  - [ ] No UI errors in settings page
  - [ ] Email content is accurate and helpful

### First Month Monitoring

- [ ] **Ongoing Success Metrics**
  - [ ] Consistent notification delivery >95%
  - [ ] Job success rate >99%
  - [ ] Zero data integrity issues
  - [ ] Performance metrics maintained
  - [ ] User opt-out rate normal (<5%)

- [ ] **Maintenance Tasks Completed**
  - [ ] Notification preferences documented for admins
  - [ ] Troubleshooting runbook created
  - [ ] Operational procedures documented
  - [ ] Team trained on system monitoring
  - [ ] Escalation path defined

---

## Rollback Plan

If critical issues occur after deployment:

### Immediate Rollback Decision

- [ ] Assess severity: Is this blocking production?
- [ ] Check if temporary fix possible (e.g., disable job via env var)
- [ ] Decide: rollback vs fix in place

### Execute Rollback (if needed)

- [ ] Stop application
- [ ] Restore database from backup (if data integrity issue)
- [ ] Revert application code to previous version
- [ ] Verify NotificationsModule not loaded (if rollback removes feature)
- [ ] Restart application
- [ ] Verify rollback successful

### Post-Rollback

- [ ] Notify users that new feature temporarily disabled
- [ ] Investigate root cause
- [ ] Fix issue in development environment
- [ ] Re-test thoroughly
- [ ] Schedule new deployment attempt

**See:** [Database Rollback Procedure](../database/NOTIFICATION_MIGRATIONS.md#rollback-procedure)

---

## Sign-Off and Completion

- [ ] **All checklist items completed**
- [ ] **No critical issues remaining**
- [ ] **Team sign-off obtained**

**Deployment approved by:** _________________ **Date:** _________

**Deployment executed by:** _________________ **Date:** _________

**Deployment verified by:** _________________ **Date:** _________

---

## Contact and References

**On-Call Support:** [Support team contact info]

**Documentation:**
- [Notification Module README](../../packages/api/src/modules/notifications/README.md)
- [API Endpoints](./NOTIFICATION_ENDPOINTS.md)
- [Database Migrations](../database/NOTIFICATION_MIGRATIONS.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Monitoring Guide](./MONITORING.md)

**External References:**
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## Notes and Observations

Use this section to document any issues encountered during deployment:

```
[Date] [Time] [Issue Description]
[Resolution taken]
[Impact assessment]

```

---

## Lessons Learned

After deployment is complete and stable (1+ week), document lessons learned:

- [ ] What went well?
- [ ] What could be improved next time?
- [ ] Any issues that surprised us?
- [ ] Any improvements needed for similar deployments?

This information will improve future deployment processes.
