# Specification: Point Expiration Notifications

## Goal
Implement an email notification system to alert users when their loyalty points are approaching expiration (30, 7, and 1 days before expiry). This is Phase 1 focusing solely on notifications for points with existing `expiresAt` timestamps. Actual point expiration automation will be handled separately in Phase 4 (Roadmap #14).

## User Stories
- As a loyalty program user, I want to receive email notifications when my points are about to expire so that I can redeem them before they're lost
- As a user, I want to opt out of expiration notification emails so that I can control the communication I receive from the platform

## Specific Requirements

**3-Tier Notification System**
- Send email notifications at three intervals: 30 days, 7 days, and 1 day before point expiration
- Each notification sent only once per user per expiration date per notification type
- Daily cron job runs at 9 AM UTC (configurable) to detect expiring points
- Use notification windows with ranges to avoid edge cases: 30-day (28-32 days), 7-day (6-8 days), 1-day (0-2 days remaining)
- Query PointLedger table for CREDIT entries where `expiresAt` falls within notification windows
- Group results by userId and expirationDate to aggregate multiple expiring point batches

**Deduplication Logic**
- Create NotificationLog table to track all notification attempts (SENT/FAILED/SKIPPED)
- Before sending notification, check NotificationLog for existing entry with same userId, notificationType, and expirationDate
- Log entry includes: userId, notificationType, status, sentAt, failureReason, expirationDate, pointsExpiring
- Composite index on (userId, notificationType, expirationDate) for fast deduplication checks

**Email Delivery via AWS SES**
- Use AWS SDK v3 (@aws-sdk/client-ses) for email sending
- Send both HTML and plain text versions of each email for client compatibility
- Subject line: "Your Rewards Bolivia Points Are Expiring Soon"
- Content includes: userName, pointsExpiring (formatted), expirationDate (formatted), currentBalance, daysRemaining, walletUrl CTA
- Rate limiting: 14 emails/second (configurable based on SES quota)
- Implement exponential backoff for temporary failures (max 3 retries)
- Template engine: Handlebars for variable substitution in email templates

**User Preference Management**
- Add `emailNotifications` boolean field to User model (default: true)
- Respect user opt-out preference: skip sending notification if emailNotifications = false
- Log skipped notifications with status "SKIPPED" for audit purposes
- API endpoint: PATCH /api/users/me/preferences with { emailNotifications: boolean }
- Frontend: simple checkbox in user settings "Receive email notifications about expiring points"

**Error Handling and Resilience**
- Missing email address: log as "FAILED" with reason "missing email", do not retry
- Invalid email format: validate before sending, log failure, do not retry
- AWS SES errors: log error details with stack trace, retry up to 3 times with exponential backoff
- Points redeemed after notification: acceptable, no cancellation logic in Phase 1
- Job failures: log error with summary statistics, alert via system logger

**Batch Processing for Performance**
- Process users in batches of 100 to avoid memory issues
- Use cursor-based pagination for querying large user sets
- Target job completion: <10 minutes for 10,000 users with expiring points
- Query performance target: <2 seconds for 100K PointLedger entries
- Email processing target: <500ms per email (template render + SES send)

**Module Architecture Following DDD Pattern**
- Create new `notifications` module with domain/application/infrastructure layers
- Domain layer: NotificationLog entity, INotificationRepository interface
- Application layer: ExpirationNotificationService, EmailService, NotificationBuilderService, SendExpirationNotificationUseCase, CheckExpiringPointsJob
- Infrastructure layer: PrismaNotificationRepository, NotificationPreferencesController, email templates
- Register module providers with DI tokens: { provide: 'INotificationRepository', useClass: PrismaNotificationRepository }

**Logging and Observability**
- Use existing logger from packages/libs/logger for consistency
- Log every notification attempt in NotificationLog table
- Job execution logs include summary: total processed, sent, failed, skipped
- Errors logged with userId, error message, stack trace for debugging
- Enable admin queries on NotificationLog for troubleshooting and analytics

## Visual Design
No visual mockups provided. Email templates will follow standard transactional email best practices with Rewards Bolivia branding.

**Email Template Requirements**
- Responsive HTML design compatible with Gmail, Outlook, Apple Mail
- Clean, professional transactional email layout
- Rewards Bolivia logo and brand colors
- Clear call-to-action button: "View Your Wallet" linking to wallet dashboard
- Unsubscribe link in footer directing to notification preferences settings
- Both HTML (.hbs) and plain text (.txt) versions for each notification tier (30-day, 7-day, 1-day)

## Existing Code to Leverage

**Daily Cron Job Pattern from generate-daily-audit-hash.job.ts**
- Use @Cron decorator with CronExpression enum for scheduling
- Wrap logic in try-catch with detailed error logging
- Log start, progress, and completion messages with relevant metrics
- Follow same structure: constructor injection, handleCron() method, Logger instance

**Repository Pattern from PrismaLedgerRepository**
- Define INotificationRepository interface in domain layer with methods: createLog, findExistingNotification, findByUser
- Implement PrismaNotificationRepository in infrastructure layer
- Use Prisma transactions for atomic operations
- Follow naming convention: interface with "I" prefix, implementation with "Prisma" prefix

**Module Registration Pattern from TransactionsModule**
- Import PrismaModule, EventEmitterModule, ScheduleModule in module imports
- Register job classes (CheckExpiringPointsJob) as providers
- Use DI token pattern for repository: { provide: 'INotificationRepository', useClass: PrismaNotificationRepository }
- Export services that might be used by other modules

**Use Case Pattern from EarnPointsUseCase**
- Use @Injectable decorator and constructor injection with @Inject('IRepositoryToken')
- Execute method takes DTO as parameter, returns structured response
- Validate inputs, perform business logic, publish events, return result
- Use HttpException for user-facing errors with appropriate status codes

**Event Publishing Pattern from TransactionEventPublisher**
- Create NotificationSentEvent domain event for future analytics
- Use EventEmitter2 from @nestjs/event-emitter to publish events
- Keep events simple with relevant data: userId, notificationType, status, timestamp

## Out of Scope
- SMS notifications via Twilio or other providers
- In-app push notifications or browser push notifications
- Point expiration automation (scheduled job to mark points as EXPIRED) - deferred to Phase 4
- Personalized redemption recommendations based on user history or AI suggestions
- Admin dashboard UI for notification analytics, metrics, charts, or performance monitoring
- Advanced user preferences (granular notification type selection, frequency settings, channel preferences per type)
- Email tracking features (open rate pixel tracking, click-through rate tracking, engagement analytics)
- User timezone-aware notification delivery (Phase 1 sends all at 9 AM UTC)
- Rich email features (direct redemption from email, dynamic product recommendations, interactive elements)
- One-click unsubscribe with token-based authentication (Phase 1 links to settings page requiring login)
- SNS webhooks for automated bounce/complaint handling (Phase 1 uses basic logging only)
