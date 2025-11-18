# Spec Requirements: Point Expiration Notifications

## Initial Description

Implement a notification system to alert users when their loyalty points are approaching expiration. This feature aims to increase point redemption rates, improve user engagement, and reduce point wastage by providing timely reminders about expiring points.

**Context:** This is Phase 1 of a larger point expiration strategy. This spec focuses solely on notifications for points that already have `expiresAt` timestamps. The actual point expiration automation (scheduled job to mark points as expired and create EXPIRE ledger entries) will be implemented separately in Phase 4 (Roadmap item #14).

## Requirements Discussion

### First Round Questions

**Q1: What is the point expiration policy? Should we assume a system-wide default (e.g., 12 months from earn date) or will expiration rules vary by business plan or transaction type?**

**Answer:** System-wide default of 12 months from earn date. Business-specific expiration rules are out of scope for Phase 1.

**Q2: When should users be notified about expiring points? I'm thinking we implement 3 notifications: 30 days before, 7 days before, and 1 day before expiration. Does that timing work, or would you prefer different intervals?**

**Answer:** Yes, implement 30 days, 7 days, and 1 day before expiration.

**Q3: Which notification channels should we support? I assume we should start with email notifications in v1 (since we need AWS SES integration anyway for other transactional emails). Should we also include in-app notifications or SMS in this phase?**

**Answer:** Email-only in v1. AWS SES for email provider.

**Q4: For the actual expiration logic (separate from notifications): Should this spec implement the scheduled job that marks points as expired and creates EXPIRE ledger entries, or is that a separate Phase 4 feature (as indicated in roadmap item #14)?**

**Answer:** Phase 1 does NOT implement expiration automation. We only check ledger entries that already have `expiresAt` and send notifications. Full expiration automation remains Phase 4 (#14).

**Q5: What should happen if a user has opted out of email notifications, or if we don't have an email address for them?**

**Answer:** Skip sending the notification but log the event as "failed notification: missing email" for audit purposes.

**Q6: Are there any features we should explicitly exclude from this implementation to keep scope manageable? For example: SMS notifications, in-app push notifications, personalized point redemption recommendations, admin dashboard for notification analytics, or advanced user preferences (notification frequency, channel preferences)?**

**Answer:** All proposed exclusions are valid. Out of scope: SMS, in-app notifications, personalized recommendations, admin dashboard for notification analytics, and advanced user preferences.

### Existing Code to Reference

**Similar Features Identified:**
- Daily audit hash generation: `packages/api/src/modules/transactions/application/jobs/generate-daily-audit-hash.job.ts` - Reference for cron job structure and scheduling pattern (runs at 3 AM UTC)
- Background worker system: `packages/worker/` - BullMQ/Redis infrastructure already in place for scheduled jobs
- Transactions module: `packages/api/src/modules/transactions/` - DDD/Clean Architecture pattern to follow
- Users module: `packages/api/src/modules/users/` - User entity and repository patterns
- PointLedger model: Contains `expiresAt` field for tracking point expiration dates
- EventEmitter pattern: Used throughout the application for domain events (e.g., `TransactionCompletedEvent`)

**Backend Patterns to Follow:**
- Repository pattern with interface (`INotificationRepository`) in domain layer, implementation (`PrismaNotificationRepository`) in infrastructure layer
- Dependency injection using string tokens (e.g., `'INotificationRepository'`)
- Use cases in `application/*.use-case.ts` files
- Event subscribers for transaction events if needed

**Frontend Integration:**
- Wallet UI components in `packages/web/src/components/wallet/` - May need user preference toggle for notifications
- TanStack Query for data fetching if we add notification preference management UI

### Follow-up Questions

No follow-up questions were needed. All requirements were clearly defined in the initial round.

## Visual Assets

### Files Provided:
No visual assets provided.

### Visual Insights:
No visual mockups or wireframes were provided. Email templates will be designed using standard transactional email best practices with Rewards Bolivia branding.

## Requirements Summary

### Functional Requirements

#### Core Notification Logic

1. **Point Expiration Detection:**
   - Daily scheduled job (cron) queries PointLedger for entries with `expiresAt` dates approaching expiration
   - Query runs once per day (suggested: 9 AM local time or configurable)
   - Identifies points expiring in: 30 days, 7 days, and 1 day
   - Only considers CREDIT ledger entries (points earned, not debits)
   - Filters for points with `expiresAt IS NOT NULL` and `expiresAt` within notification windows

2. **Notification Timing:**
   - **30-day warning**: First reminder when points have 30 days remaining
   - **7-day warning**: Second reminder when points have 7 days remaining
   - **1-day warning**: Final reminder when points have 1 day remaining (last chance)
   - Each notification is sent only once per expiration date per user

3. **Deduplication Logic:**
   - Track sent notifications in `NotificationLog` table
   - Before sending, check if notification already sent for this user/expiration date/notification type
   - Prevent duplicate notifications even if job runs multiple times

4. **Email Content:**
   - **Subject Line:** "Your Rewards Bolivia Points Are Expiring Soon"
   - **Greeting:** Personalized with user's name
   - **Key Information:**
     - Number of points expiring
     - Exact expiration date (formatted: "December 18, 2025")
     - Current total point balance
     - Urgency indicator based on days remaining (30/7/1 days)
   - **Call to Action:** "View Your Wallet" button linking to wallet dashboard
   - **Footer:** Standard transactional email footer with company info and unsubscribe link
   - **Both Formats:** Plain text and HTML versions for compatibility

5. **User Preference Management:**
   - Add `emailNotifications` boolean field to User model (default: true)
   - Users can opt out of expiration notifications via settings page
   - Even if opted out, log the "skipped notification" event for audit purposes
   - Future enhancement: Granular preferences (notification type, frequency)

#### Notification Processing

1. **Batch Processing:**
   - Process notifications in batches of 100 users to avoid memory issues
   - Use cursor-based pagination for querying users with expiring points
   - Rate limit AWS SES sends to comply with sending quotas (default: 14 emails/second)

2. **Error Handling:**
   - **Missing Email:** Log as "failed notification: missing email", do not retry
   - **Invalid Email:** Validate email format before sending, log validation failures
   - **AWS SES Errors:** Log error details, implement retry logic with exponential backoff (max 3 retries)
   - **Points Redeemed After Notification:** Not an error - acceptable if user redeems after receiving warning
   - **Job Failures:** Alert admins via system logging if job fails completely

3. **Logging and Audit:**
   - Every notification attempt logged in `NotificationLog` table
   - Fields: userId, notificationType, status (SENT/FAILED/SKIPPED), sentAt, failureReason, expirationDate
   - Enable admin queries for notification history and debugging
   - Integrate with existing logging infrastructure (`packages/libs/logger`)

### Reusability Opportunities

- **Cron Job Pattern:** Reuse structure from `generate-daily-audit-hash.job.ts` for scheduling and execution
- **BullMQ Workers:** Leverage existing worker infrastructure in `packages/worker/` for queue processing
- **Repository Pattern:** Follow same DI and repository interface pattern as existing modules
- **Email Service:** Build generic `EmailService` that can be reused for future transactional emails (password resets, transaction confirmations, etc.)
- **Notification Framework:** Design `NotificationLog` and related services to support future notification types (SMS, push, in-app)

### Scope Boundaries

#### In Scope

1. **Backend Implementation:**
   - Scheduled job to detect expiring points (daily cron)
   - Email notification sending via AWS SES
   - NotificationLog database table and repository
   - User preference management (emailNotifications field)
   - Deduplication logic to prevent duplicate notifications
   - Error handling and retry mechanisms
   - Logging and audit trail

2. **Database Changes:**
   - Add `NotificationLog` table (userId, notificationType, status, sentAt, failureReason, expirationDate, createdAt)
   - Add `emailNotifications` boolean field to User model (default: true)
   - Migration scripts for both schema changes

3. **Email Templates:**
   - HTML email template with responsive design
   - Plain text email template for fallback
   - Template variables: userName, pointsExpiring, expirationDate, currentBalance, daysRemaining
   - Managed in code (likely using Handlebars or similar template engine)

4. **Integration:**
   - AWS SES configuration and setup
   - Environment variables for AWS credentials and SES region
   - Integration with existing BullMQ worker system

5. **Testing:**
   - Unit tests for notification detection logic
   - Unit tests for email template rendering
   - Unit tests for deduplication logic
   - Integration tests for notification job execution
   - Mock AWS SES for testing (no actual emails sent in test environment)
   - 70% code coverage minimum (90%+ for critical notification logic)

6. **Frontend (Minimal):**
   - User settings page toggle for email notifications preference
   - Simple checkbox: "Receive email notifications about expiring points"
   - Save preference via API call to update User model

#### Out of Scope

1. **Advanced Notification Channels:**
   - SMS notifications (requires Twilio or similar integration)
   - In-app push notifications (requires mobile app or web push setup)
   - Browser push notifications

2. **Point Expiration Automation:**
   - Scheduled job to actually expire points (mark as EXPIRED, create BURN ledger entries)
   - This remains Phase 4 (Roadmap #14) - separate from notification system

3. **Personalized Recommendations:**
   - Suggesting specific products/businesses to redeem points at
   - AI-driven redemption suggestions based on user history
   - Point value optimization recommendations

4. **Admin Dashboard:**
   - Admin UI for viewing notification analytics (sent, failed, open rates)
   - Notification performance metrics and charts
   - Manual notification triggering interface
   - May be added in future enhancement

5. **Advanced User Preferences:**
   - Granular notification preferences (choose which notification types to receive)
   - Notification frequency settings (daily digest vs immediate)
   - Channel preferences per notification type (email vs SMS)
   - Quiet hours or do-not-disturb settings

6. **Email Tracking:**
   - Open rate tracking (pixel tracking)
   - Click-through rate tracking (link tracking)
   - Email engagement analytics
   - Bounce and complaint handling (basic handling only, no advanced analytics)

7. **Notification Scheduling:**
   - User-specific preferred notification times
   - Time zone-aware notification delivery
   - For Phase 1, all notifications sent at same time globally (9 AM UTC or configured time)

8. **Rich Email Features:**
   - Point redemption directly from email
   - Dynamic product recommendations in email
   - Interactive elements (carousels, surveys)
   - Phase 1 uses simple, clean transactional email design

### Technical Considerations

#### Database Schema Changes

**NotificationLog Table:**
```prisma
model NotificationLog {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  notificationType  String   // "EXPIRATION_30_DAYS", "EXPIRATION_7_DAYS", "EXPIRATION_1_DAY"
  status            String   // "SENT", "FAILED", "SKIPPED"
  sentAt            DateTime?
  failureReason     String?
  expirationDate    DateTime // The actual expiration date of the points
  pointsExpiring    Int      // Number of points expiring on that date
  createdAt         DateTime @default(now())

  @@index([userId, notificationType, expirationDate])
  @@index([status, createdAt])
}
```

**User Model Update:**
```prisma
model User {
  // ... existing fields
  emailNotifications Boolean @default(true)
  notificationLogs   NotificationLog[]
}
```

#### Scheduled Job Specifications

**Job Name:** `CheckExpiringPointsJob`

**Frequency:** Daily at 9:00 AM UTC (configurable via environment variable)

**Implementation Pattern:**
- Follow structure from `generate-daily-audit-hash.job.ts`
- Use NestJS `@Cron()` decorator with cron expression
- Register in appropriate module (likely new `notifications` module)

**Job Logic Flow:**
1. Calculate notification windows (30 days, 7 days, 1 day from now)
2. Query PointLedger for CREDIT entries with `expiresAt` in each window
3. Group results by userId and expirationDate
4. For each user/expiration combination:
   - Check NotificationLog for existing notification (deduplication)
   - Check user's `emailNotifications` preference
   - Check user has valid email address
   - If all checks pass, enqueue email notification job
5. Log summary statistics (processed, sent, skipped, failed)

**Performance Considerations:**
- Use cursor-based pagination for large user sets
- Process in batches of 100 to avoid memory issues
- Index on `PointLedger.expiresAt` for efficient querying
- Consider read replica for long-running queries if needed

#### AWS SES Integration

**Configuration Requirements:**
- AWS SES account with verified domain (e.g., notifications@rewards-bolivia.com)
- Move SES out of sandbox mode for production (allows sending to unverified emails)
- Environment variables: `AWS_SES_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SES_FROM_EMAIL`

**Email Service Architecture:**
- Create generic `EmailService` in new `notifications` module
- Use AWS SDK v3 for SES (`@aws-sdk/client-ses`)
- Methods: `sendTransactionalEmail(to, subject, htmlBody, textBody)`
- Handle SES rate limits (default 14 emails/second in production, 1/second in sandbox)
- Implement exponential backoff for rate limit errors

**Rate Limiting:**
- Use BullMQ job rate limiting: `limiter: { max: 14, duration: 1000 }` (14 per second)
- Adjust based on SES sending quota for account
- Monitor SES usage metrics via CloudWatch

**Error Handling:**
- **Bounce/Complaint Handling:** Log and mark user email as invalid (basic only, no SNS webhooks in Phase 1)
- **Temporary Failures:** Retry with exponential backoff (3 attempts max)
- **Permanent Failures:** Log and skip, do not retry

#### Email Template Structure

**Template Engine:** Handlebars (or similar, integrated with NestJS)

**Template Files Location:** `packages/api/src/modules/notifications/templates/`

**Templates Required:**
1. `expiration-30-days.hbs` (HTML version)
2. `expiration-30-days.txt` (plain text version)
3. `expiration-7-days.hbs` (HTML version)
4. `expiration-7-days.txt` (plain text version)
5. `expiration-1-day.hbs` (HTML version)
6. `expiration-1-day.txt` (plain text version)

**Template Variables:**
- `{{userName}}`: User's first name or full name
- `{{pointsExpiring}}`: Number of points expiring (formatted with commas)
- `{{expirationDate}}`: Formatted date (e.g., "December 18, 2025")
- `{{currentBalance}}`: User's total current point balance
- `{{daysRemaining}}`: 30, 7, or 1
- `{{walletUrl}}`: Deep link to wallet dashboard

**Email Design:**
- Responsive HTML design (mobile-friendly)
- Rewards Bolivia branding (logo, colors)
- Clear call-to-action button ("View Your Wallet")
- Unsubscribe link in footer (links to notification preferences page)
- Professional, clean transactional email layout

#### Module Organization

Following DDD/Clean Architecture pattern:

```
packages/api/src/modules/notifications/
├── domain/
│   ├── entities/
│   │   └── notification-log.entity.ts
│   ├── repositories/
│   │   └── notification.repository.ts (INotificationRepository interface)
│   └── events/
│       └── notification-sent.event.ts
├── application/
│   ├── services/
│   │   ├── email.service.ts (AWS SES integration)
│   │   ├── notification-builder.service.ts (template rendering)
│   │   └── expiration-notification.service.ts (business logic)
│   ├── use-cases/
│   │   └── send-expiration-notification.use-case.ts
│   └── jobs/
│       └── check-expiring-points.job.ts (cron job)
└── infrastructure/
    ├── controllers/
    │   └── notification-preferences.controller.ts (user settings API)
    ├── repositories/
    │   └── prisma-notification.repository.ts
    └── templates/
        ├── expiration-30-days.hbs
        ├── expiration-30-days.txt
        ├── expiration-7-days.hbs
        ├── expiration-7-days.txt
        ├── expiration-1-day.hbs
        └── expiration-1-day.txt
```

**Module Registration:**
- Register `NotificationsModule` in root `AppModule`
- Provide repository using DI token: `{ provide: 'INotificationRepository', useClass: PrismaNotificationRepository }`
- Import BullMQ module for job queue
- Configure cron job for daily expiration checks

#### Query Optimization

**Critical Queries:**

1. **Find Expiring Points:**
```sql
SELECT userId, expiresAt, SUM(credit) as pointsExpiring
FROM PointLedger
WHERE expiresAt BETWEEN :startDate AND :endDate
  AND credit > 0
GROUP BY userId, expiresAt
```

**Required Indexes:**
```prisma
@@index([expiresAt, credit]) // Composite index for expiration queries
@@index([userId, expiresAt]) // For user-specific lookups
```

2. **Check Notification History:**
```sql
SELECT id FROM NotificationLog
WHERE userId = :userId
  AND notificationType = :type
  AND expirationDate = :date
LIMIT 1
```

**Required Index:**
```prisma
@@index([userId, notificationType, expirationDate]) // Already in schema above
```

**Performance Targets:**
- Expiring points query: < 2 seconds for 100K ledger entries
- Notification history check: < 100ms per user
- Email sending: < 500ms per email (including SES API call)
- Total job duration: < 10 minutes for 10K users with expiring points

#### Integration Points

**Frontend Integration:**
- New settings page or section in existing user profile
- API endpoint: `PATCH /api/users/me/preferences` with body `{ emailNotifications: boolean }`
- TanStack Query mutation for preference updates
- Simple checkbox UI component

**Existing Systems Integration:**
- **PointLedger:** Query `expiresAt` field (ensure field exists or add in migration)
- **User Model:** Add `emailNotifications` field
- **BullMQ Worker:** Integrate notification jobs into existing worker infrastructure
- **Logging:** Use existing logger from `packages/libs/logger`
- **EventEmitter:** Potentially emit `NotificationSentEvent` for future analytics

**Environment Configuration:**
```bash
# .env additions
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_SES_FROM_EMAIL=notifications@rewards-bolivia.com
NOTIFICATION_CRON_SCHEDULE="0 9 * * *"  # 9 AM UTC daily
NOTIFICATION_BATCH_SIZE=100
```

## Success Criteria

This feature will be considered successful when:

### 1. Functionality Metrics

- **Notification Detection Accuracy:** 100% of points expiring within notification windows (30/7/1 days) are correctly identified
- **Deduplication Success:** 0% duplicate notifications sent for same user/expiration date/type combination
- **Email Delivery Rate:** >95% of queued emails successfully sent via AWS SES (excluding user opt-outs and missing emails)
- **Preference Respect:** 100% compliance with user opt-out preferences (no emails sent to users with `emailNotifications = false`)

### 2. Performance Metrics

- **Job Execution Time:** Daily cron job completes in <10 minutes for up to 10,000 users with expiring points
- **Query Performance:** Expiring points query executes in <2 seconds for 100K PointLedger entries
- **Email Processing:** Individual email processing (template render + SES send) in <500ms per email
- **Rate Limiting:** Email sending stays within AWS SES limits (no rate limit errors in production)

### 3. User Experience

- **Email Quality:**
  - Emails render correctly in all major email clients (Gmail, Outlook, Apple Mail)
  - Mobile-responsive design works on small screens
  - Personalization works (userName, pointsExpiring, etc. correctly populated)
  - "View Your Wallet" CTA links to correct wallet dashboard page

- **Preference Management:**
  - Users can easily find and toggle email notification preference in settings
  - Preference updates are immediate (no delay before taking effect)
  - Clear labeling explains what notifications are being controlled

- **Timeliness:**
  - Notifications sent within 24 hours of notification window (e.g., 30-day warning sent when points have 29-31 days remaining)
  - Users receive notifications at reasonable time (9 AM UTC or configured time, not middle of night for most users)

### 4. Code Quality

- **Test Coverage:**
  - 70% overall test coverage for notifications module
  - 90%+ coverage for critical notification logic (detection, deduplication, email sending)
  - Unit tests for all services and use cases
  - Integration tests for cron job execution
  - Mock AWS SES in all tests (no real emails sent)

- **Architecture Compliance:**
  - Follows DDD/Clean Architecture pattern (domain/application/infrastructure layers)
  - Repository pattern with interfaces and DI
  - Use case pattern for business logic
  - Proper error handling and logging throughout

- **Code Standards:**
  - Follows project naming conventions (kebab-case files, PascalCase classes)
  - TypeScript strict mode with no `any` types
  - ESLint and Prettier passing with no warnings
  - Conventional Commits for all commit messages

### 5. Operational Metrics

- **Logging and Observability:**
  - Every notification attempt logged in NotificationLog table
  - Job execution logged with summary statistics (processed, sent, failed, skipped)
  - Errors logged with sufficient detail for debugging (error messages, stack traces, userId)
  - Admin can query notification history via database or future admin API

- **Error Recovery:**
  - Temporary email failures retried up to 3 times with exponential backoff
  - Permanent failures logged and skipped (no infinite retry loops)
  - Job failures alert admins via system logs
  - Failed notifications do not block processing of subsequent notifications

- **Data Integrity:**
  - NotificationLog entries created atomically with email sending
  - No orphaned log entries or inconsistent states
  - Migration scripts run successfully with no data loss
  - Rollback plan documented for database schema changes

### 6. Security and Compliance

- **Email Security:**
  - AWS SES credentials stored securely (environment variables, not code)
  - No sensitive user data logged in plain text
  - Unsubscribe mechanism works correctly
  - Email headers include proper SPF/DKIM/DMARC for domain authentication

- **Data Privacy:**
  - User email addresses not exposed in logs or error messages
  - NotificationLog table accessible only to authenticated admins
  - User can opt out of notifications without affecting account functionality

### 7. Documentation

- **Technical Documentation:**
  - README in notifications module explaining architecture and usage
  - Environment variable documentation updated with AWS SES config
  - Database migration scripts documented
  - Email template variable documentation

- **User-Facing Documentation:**
  - Help text in notification preferences explaining what emails user will receive
  - FAQ entry about point expiration and notifications
  - Support team trained on troubleshooting notification issues

## Open Questions

The following items should be clarified during implementation:

### 1. PointLedger Schema Verification
- **Question:** Does the `PointLedger` table already have an `expiresAt` field, or do we need to add it in a migration?
- **Action:** Verify Prisma schema and add field if missing
- **Migration Note:** If adding field, existing records will have `NULL` values (acceptable for Phase 1)

### 2. Notification Timing Precision
- **Question:** Should the notification windows be exact (e.g., exactly 30 days) or ranges (e.g., 28-32 days)?
- **Recommendation:** Use ranges to avoid missing users due to timing edge cases
  - 30-day window: 28-32 days remaining
  - 7-day window: 6-8 days remaining
  - 1-day window: 0-2 days remaining
- **Decide during implementation:** Based on testing and expected job frequency

### 3. User Time Zone Handling
- **Question:** Should emails be sent at 9 AM in user's local time zone, or globally at 9 AM UTC?
- **Current Plan:** Global 9 AM UTC (simpler for Phase 1)
- **Future Enhancement:** User time zone preferences (requires time zone field in User model)

### 4. Multiple Expiration Dates
- **Question:** If a user has points expiring on multiple dates (e.g., 100 points on Dec 1, 200 points on Dec 15), do we send:
  - One email listing all upcoming expirations?
  - Separate emails for each expiration date?
- **Recommendation:** One email per notification window, aggregating all expirations in that window
  - Example: "You have 300 points expiring in the next 30 days (100 on Dec 1, 200 on Dec 15)"
- **Decide during implementation:** Based on email template design and user experience considerations

### 5. Points Redeemed After Notification
- **Question:** If user redeems points after receiving 30-day warning, should we cancel the 7-day and 1-day warnings?
- **Current Plan:** No cancellation logic in Phase 1 (keep it simple)
  - Notification may mention points already redeemed (acceptable UX trade-off)
- **Future Enhancement:** Track redeemed points and adjust subsequent notifications

### 6. Email Template Localization
- **Question:** Do we need to support multiple languages (Spanish for Bolivia market)?
- **Current Plan:** English-only for Phase 1
- **Future Enhancement:** Add Spanish translations (requires i18n framework)
- **Recommendation:** Use language-neutral design so templates are easy to localize later

### 7. Unsubscribe Link Implementation
- **Question:** Should unsubscribe link go to:
  - General settings page with checkbox?
  - One-click unsubscribe endpoint (no login required)?
  - Dedicated unsubscribe page with confirmation?
- **Recommendation:** Link to settings page (requires login) for Phase 1
- **Future Enhancement:** One-click unsubscribe with token-based authentication (better UX, CAN-SPAM compliant)

### 8. Email Bounce/Complaint Handling
- **Question:** How should we handle bounces and spam complaints reported by AWS SES?
- **Current Plan:** Basic logging only (no automated actions)
- **Future Enhancement:** Set up SNS webhooks to automatically mark emails as invalid and suppress future sends
- **Action:** Monitor SES bounce/complaint rates manually during initial rollout

### 9. Notification Re-sending
- **Question:** If email fails temporarily (SES error), should we retry on next day's job run or implement immediate retry?
- **Current Plan:** Retry 3 times within same job run with exponential backoff, then log as failed
- **Do not retry:** on next day's run (would create duplicate notifications)

### 10. Admin Override
- **Question:** Should admins be able to manually trigger notifications for specific users (e.g., for testing or customer support)?
- **Current Plan:** No admin override in Phase 1 (add in future if needed)
- **Testing Approach:** Use test user accounts with manipulated `expiresAt` dates for testing

These questions should be resolved through code inspection, database schema review, and UX design discussions during the implementation phase. Document final decisions in implementation notes or code comments.
