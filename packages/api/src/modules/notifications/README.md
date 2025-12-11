# Notifications Module

The Notifications Module implements a comprehensive point expiration notification system for the Rewards Bolivia platform. It alerts users when their loyalty points are approaching expiration (30, 7, and 1 days before expiry) via email, helping to maximize point redemption and improve user engagement.

## Overview

**Phase 1 Scope:** This module focuses exclusively on email notifications for points with existing `expiresAt` timestamps. Actual point expiration automation (scheduled job to mark points as EXPIRED) is deferred to Phase 4.

### Key Features

- **3-Tier Notification System:** Automated email alerts at 30, 7, and 1 day before point expiration
- **Intelligent Deduplication:** Prevents duplicate notifications using composite index queries
- **User Preference Management:** Respects user opt-out preferences; users can control email communication
- **AWS SES Integration:** Reliable transactional email delivery with rate limiting and retry logic
- **Responsive Email Templates:** Professional HTML and plain text email templates compatible with major email clients
- **Batch Processing:** Efficient processing of large user sets with cursor-based pagination
- **Comprehensive Logging:** Full audit trail of all notification attempts in NotificationLog table
- **Error Resilience:** Exponential backoff retry logic for temporary failures; graceful handling of permanent errors

## Architecture Overview

The module follows **Domain-Driven Design (DDD) and Clean Architecture** patterns with strict layer separation:

```
notifications/
├── domain/                    # Business logic and entities
│   ├── entities/
│   │   └── notification-log.entity.ts      # NotificationLog entity, status/type enums
│   ├── repositories/
│   │   └── notification.repository.ts      # INotificationRepository interface
│   ├── events/
│   │   └── notification-sent.event.ts      # Domain event for analytics
│   └── dtos/
│       ├── create-notification-log.dto.ts
│       ├── expiring-points.dto.ts
│       └── email-notification.dto.ts
│
├── application/               # Use cases and application services
│   ├── services/
│   │   ├── email.service.ts                      # AWS SES email sending with rate limiting
│   │   ├── notification-builder.service.ts       # Template rendering (Handlebars)
│   │   ├── expiration-notification.service.ts    # Core notification logic
│   │   └── notification-config.service.ts        # Configuration management
│   ├── use-cases/
│   │   └── send-expiration-notification.use-case.ts  # Orchestrates email sending workflow
│   ├── jobs/
│   │   └── check-expiring-points.job.ts          # Daily cron job for detecting expiring points
│   └── utils/
│       └── email-validator.ts                    # Email validation utility
│
└── infrastructure/            # Technical implementation
    ├── controllers/
    │   ├── notification-preferences.controller.ts    # API endpoints for preference management
    │   └── dtos/
    │       └── update-preferences.dto.ts
    ├── repositories/
    │   └── prisma-notification.repository.ts    # Prisma implementation of INotificationRepository
    ├── templates/                               # Email templates (Handlebars)
    │   ├── expiration-30-days.hbs
    │   ├── expiration-30-days.txt
    │   ├── expiration-7-days.hbs
    │   ├── expiration-7-days.txt
    │   ├── expiration-1-day.hbs
    │   └── expiration-1-day.txt
    └── test-helpers/
        ├── notification-test-fixtures.ts        # Test data builders
        └── aws-ses-mock.ts                      # AWS SES mocking utilities
```

## Domain Layer

### NotificationLog Entity

Represents a record of a notification attempt with status and timing information.

```typescript
enum NotificationType {
  EXPIRATION_30_DAYS = 'EXPIRATION_30_DAYS',
  EXPIRATION_7_DAYS = 'EXPIRATION_7_DAYS',
  EXPIRATION_1_DAY = 'EXPIRATION_1_DAY',
}

enum NotificationStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

class NotificationLog {
  id: string;                    // UUID
  userId: string;                // User ID (foreign key)
  notificationType: NotificationType;
  status: NotificationStatus;
  sentAt?: Date;                 // When email was sent (null for SKIPPED/FAILED)
  failureReason?: string;        // "missing email", "invalid format", "SES error", etc.
  expirationDate: Date;          // When the points expire
  pointsExpiring: number;        // Number of points expiring on that date
  createdAt: Date;               // When log entry was created
}
```

### INotificationRepository Interface

Defines data access contract for notification logs.

```typescript
interface INotificationRepository {
  /**
   * Creates a new notification log entry
   */
  createLog(data: CreateNotificationLogDto): Promise<NotificationLog>;

  /**
   * Finds existing notification to enable deduplication
   */
  findExistingNotification(
    userId: string,
    notificationType: string,
    expirationDate: Date,
  ): Promise<NotificationLog | null>;

  /**
   * Finds all notifications for a user
   */
  findByUser(userId: string, options?: QueryOptions): Promise<NotificationLog[]>;

  /**
   * Finds notifications within a date range for admin queries
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<NotificationLog[]>;
}
```

## Application Layer

### Key Services

#### EmailService

Handles transactional email sending via AWS SES with built-in safety features.

**Features:**
- Email validation before sending
- Rate limiting (configurable emails/second, default 14/sec)
- Exponential backoff retry logic (max 3 retries)
- Distinguishes temporary vs permanent failures
- Comprehensive error logging

**Usage:**
```typescript
await emailService.sendTransactionalEmail(
  'user@example.com',
  'Your Rewards Bolivia Points Are Expiring Soon',
  htmlBody,
  textBody,
);
```

#### NotificationBuilderService

Compiles and renders Handlebars email templates with user-specific data.

**Supported Variables:**
- `{{userName}}` - User's first name or full name
- `{{pointsExpiring}}` - Number of points expiring (formatted with commas)
- `{{expirationDate}}` - Formatted expiration date (e.g., "December 18, 2025")
- `{{currentBalance}}` - User's total current point balance
- `{{daysRemaining}}` - Days until expiration (30, 7, or 1)
- `{{walletUrl}}` - Deep link to wallet dashboard

**Usage:**
```typescript
const { html, text } = await notificationBuilderService.renderEmailContent(
  'expiration-30-days',
  {
    userName: 'John Doe',
    pointsExpiring: 500,
    expirationDate: 'December 18, 2025',
    currentBalance: 1250,
    daysRemaining: 30,
    walletUrl: 'http://localhost:5173/wallet',
  },
);
```

#### ExpirationNotificationService

Core business logic for detecting expiring points and processing notifications.

**Methods:**
- `findExpiringPoints(window)` - Queries PointLedger for expiring points within date range
- `processNotifications(expiringPoints, notificationType)` - Batch processes notifications with deduplication and preference checking

**Key Responsibilities:**
- Grouping points by userId and expirationDate
- Respecting user `emailNotifications` preference
- Checking deduplication log before sending
- Batch processing (100 users at a time)
- Returning summary statistics (sent/failed/skipped counts)

#### NotificationConfigService

Loads notification configuration from environment variables for consistency across the application.

**Methods:**
- `getSESConfig()` - Returns AWS SES region and credentials
- `getCronSchedule()` - Returns cron expression for job scheduling
- `getBatchSize()` - Returns batch size for notification processing
- `getRateLimit()` - Returns rate limit (emails per second)
- `getWalletUrl()` - Returns frontend wallet dashboard URL

### Use Cases

#### SendExpirationNotificationUseCase

Orchestrates the complete email sending workflow:

1. Validates user email address
2. Checks deduplication log
3. Renders email template with user data
4. Sends email via AWS SES
5. Creates notification log entry
6. Publishes NotificationSentEvent

## Scheduled Jobs

### CheckExpiringPointsJob

Runs daily (default 9 AM UTC) to detect points approaching expiration and trigger notifications.

**Workflow:**
1. Calculate notification windows:
   - 30-day: 28-32 days from now
   - 7-day: 6-8 days from now
   - 1-day: 0-2 days from now
2. For each window, query PointLedger for expiring points
3. Group points by user and expiration date
4. Process notifications with deduplication and preference checking
5. Log summary statistics (processed, sent, failed, skipped)

**Configuration:**
- Schedule: `NOTIFICATION_CRON_SCHEDULE` (default: "0 9 * * *")
- Batch size: `NOTIFICATION_BATCH_SIZE` (default: 100)
- Rate limit: `NOTIFICATION_RATE_LIMIT` (default: 14 emails/sec)

## Notification Workflow

### End-to-End Flow

```
Daily at 9 AM UTC
  ↓
CheckExpiringPointsJob runs
  ↓
Calculate 3 notification windows (30/7/1 day)
  ↓
For each window:
  ├─ Query PointLedger for CREDIT entries with expiresAt in range
  ├─ Group by userId and expirationDate
  ├─ For each user/expiration combination:
  │  ├─ Check NotificationLog for existing notification (deduplication)
  │  ├─ Check User.emailNotifications preference
  │  ├─ Validate user email address
  │  ├─ If all checks pass:
  │  │  ├─ Render email template with user data
  │  │  ├─ Send email via AWS SES (with rate limiting)
  │  │  ├─ Create log entry with status=SENT
  │  │  └─ Publish NotificationSentEvent
  │  ├─ If user opted out:
  │  │  └─ Create log entry with status=SKIPPED, reason="user opted out"
  │  ├─ If email missing:
  │  │  └─ Create log entry with status=FAILED, reason="missing email"
  │  └─ If send fails:
  │     ├─ Retry up to 3 times with exponential backoff
  │     └─ Create log entry with status=FAILED, reason=error detail
  ↓
Log job summary: {processed: N, sent: N, failed: N, skipped: N}
```

## API Endpoints

### Update User Notification Preferences

**Endpoint:** `PATCH /api/users/me/preferences`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "emailNotifications": true
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "emailNotifications": true,
  "message": "Preferences updated successfully"
}
```

### Get User Notification Preferences

**Endpoint:** `GET /api/users/me/preferences`

**Authentication:** Required (JWT token)

**Response:**
```json
{
  "emailNotifications": true
}
```

## Email Templates

The module includes 6 email templates (3 HTML + 3 plain text versions):

### 30-Day Warning
- **Purpose:** First reminder when points have 30 days remaining
- **Tone:** Informative, not urgent
- **CTA:** "View Your Wallet" button
- **Files:**
  - `expiration-30-days.hbs` (HTML)
  - `expiration-30-days.txt` (Plain text)

### 7-Day Warning
- **Purpose:** Second reminder with increased urgency
- **Tone:** "Only 7 days left" messaging
- **CTA:** Prominent "View Your Wallet" button
- **Files:**
  - `expiration-7-days.hbs` (HTML)
  - `expiration-7-days.txt` (Plain text)

### 1-Day Warning
- **Purpose:** Final reminder, last chance to redeem
- **Tone:** Maximum urgency: "Last Chance" or "Expiring Tomorrow"
- **CTA:** Bold, prominent call-to-action
- **Files:**
  - `expiration-1-day.hbs` (HTML)
  - `expiration-1-day.txt` (Plain text)

### Template Variables Reference

All templates support these variables:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `userName` | string | User's first or full name | "John Doe" |
| `pointsExpiring` | number | Points expiring on the date | 500 |
| `expirationDate` | string | Formatted expiration date | "December 18, 2025" |
| `currentBalance` | number | User's total point balance | 1250 |
| `daysRemaining` | number | Days until expiration | 30, 7, or 1 |
| `walletUrl` | string | Link to wallet dashboard | "https://rewards.app/wallet" |

## Configuration

### Environment Variables

**AWS SES Configuration:**
```env
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_iam_access_key
AWS_SECRET_ACCESS_KEY=your_iam_secret_key
AWS_SES_FROM_EMAIL=notifications@rewards-bolivia.com
```

**Notification Job Configuration:**
```env
NOTIFICATION_CRON_SCHEDULE="0 9 * * *"      # 9 AM UTC daily
NOTIFICATION_BATCH_SIZE=100                  # Users per batch
NOTIFICATION_RATE_LIMIT=14                   # Emails per second
```

**Frontend Configuration:**
```env
FRONTEND_WALLET_URL=http://localhost:5173/wallet
```

### Loading Configuration

The `NotificationConfigService` loads all configuration from environment variables with sensible defaults:

```typescript
const config = notificationConfigService.getSESConfig();
const schedule = notificationConfigService.getCronSchedule();
const batchSize = notificationConfigService.getBatchSize();
```

## Database Schema

### NotificationLog Table

```prisma
model NotificationLog {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  notificationType  String   // "EXPIRATION_30_DAYS", "EXPIRATION_7_DAYS", "EXPIRATION_1_DAY"
  status            String   // "SENT", "FAILED", "SKIPPED"
  sentAt            DateTime?
  failureReason     String?
  expirationDate    DateTime
  pointsExpiring    Int
  createdAt         DateTime @default(now())

  @@index([userId, notificationType, expirationDate])  // For deduplication
  @@index([status, createdAt])                         // For querying by status
}
```

### User Model Update

```prisma
model User {
  // ... existing fields
  emailNotifications Boolean              @default(true)
  notificationLogs   NotificationLog[]
}
```

## Module Registration

The NotificationsModule is registered in the root `AppModule` and exports key services for use by other modules:

```typescript
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    // ... other modules
  ],
})
export class AppModule {}
```

**Exported Services:**
- `ExpirationNotificationService`
- `EmailService`
- `SendExpirationNotificationUseCase`
- `NotificationConfigService`

## Testing Strategy

The module includes comprehensive test coverage focused on critical workflows:

### Test Categories

**Unit Tests:**
- EmailService: email validation, rate limiting, retry logic
- NotificationBuilderService: template rendering with variables
- ExpirationNotificationService: point detection, deduplication logic
- NotificationConfigService: configuration loading

**Integration Tests:**
- CheckExpiringPointsJob: full notification detection workflow
- SendExpirationNotificationUseCase: email sending workflow
- NotificationPreferencesController: API endpoint behavior
- Deduplication: preventing duplicate notifications
- User preferences: respecting emailNotifications field

### Running Tests

```bash
# Run all notification tests
pnpm test notifications

# Run with coverage
pnpm test notifications --coverage

# Run specific test file
pnpm test send-expiration-notification.use-case.spec.ts
```

### Test Fixtures and Helpers

The module includes test utilities in `test-helpers/`:

**notification-test-fixtures.ts:**
- `createTestUser()` - Create test user with emailNotifications setting
- `createExpiringPointsForUser()` - Create PointLedger entries with expiresAt dates
- `createBatchExpiringPoints()` - Batch create expiring points
- `queryNotificationLogs()` - Query notification history

**aws-ses-mock.ts:**
- `MockSESStore` - In-memory store of sent emails
- `setupSESMock()` - Configure AWS SES mocking
- `assertEmailSent()` - Verify specific email was sent

### AWS SES Mocking

All tests mock AWS SES to prevent sending real emails:

```typescript
import { setupSESMock } from '../test-helpers/aws-ses-mock';

describe('Email Sending', () => {
  beforeEach(() => {
    setupSESMock();
  });

  it('should send email', async () => {
    await emailService.sendTransactionalEmail(...);
    expect(MockSESStore.emails).toHaveLength(1);
  });
});
```

## Performance Characteristics

### Design Goals

- **Job Execution Time:** < 10 minutes for 10,000 users with expiring points
- **Query Performance:** < 2 seconds for 100K PointLedger entries
- **Email Processing:** < 500ms per email (template render + SES send)
- **Rate Limiting:** Stay within AWS SES quotas (14 emails/sec in production)

### Optimization Strategies

**Query Optimization:**
- Composite indexes on PointLedger: `(expiresAt, credit)` and `(accountId, expiresAt)`
- Composite index on NotificationLog: `(userId, notificationType, expirationDate)`
- Selective field queries (only needed columns)

**Batch Processing:**
- Process 100 users at a time (configurable)
- Cursor-based pagination for large result sets
- Aggregation of points per user/expiration date

**Rate Limiting:**
- Sliding window rate limiter (14 emails/sec default)
- Configurable per AWS SES quota
- Prevents temporary throttling errors

**Template Caching:**
- Compiled Handlebars templates cached in memory
- Reduces compilation overhead for repeated sends

## Monitoring and Observability

### Logging

Every notification attempt is logged:
- **SENT:** Email successfully delivered
- **FAILED:** Email send failed after retries
- **SKIPPED:** Email not sent (user opted out, missing email, etc.)

### Querying Notification History

```typescript
// Find all notifications for a user
const logs = await notificationRepository.findByUser(userId);

// Check if notification already sent
const existing = await notificationRepository.findExistingNotification(
  userId,
  NotificationType.EXPIRATION_30_DAYS,
  expirationDate,
);

// Find all notifications by status
const failed = await prisma.notificationLog.findMany({
  where: { status: NotificationStatus.FAILED },
});
```

### Job Execution Logs

The CheckExpiringPointsJob logs:
- Job start and completion timestamps
- Summary statistics per notification window (processed, sent, failed, skipped)
- Errors with stack traces

Example log output:
```
[CheckExpiringPointsJob] Starting point expiration notification job
[CheckExpiringPointsJob] Processing 30-day window: 150 users identified
[CheckExpiringPointsJob] 30-day results: sent=142, failed=3, skipped=5
[CheckExpiringPointsJob] Processing 7-day window: 45 users identified
[CheckExpiringPointsJob] 7-day results: sent=44, failed=0, skipped=1
[CheckExpiringPointsJob] Processing 1-day window: 12 users identified
[CheckExpiringPointsJob] 1-day results: sent=11, failed=0, skipped=1
[CheckExpiringPointsJob] Job completed successfully in 4.5 minutes
```

## Common Use Cases

### Example 1: Sending Manual Notification (Testing)

```typescript
// In a test or manual trigger endpoint
const expiringPoints: ExpiringPointsDto = {
  userId: 'user-123',
  pointsExpiring: 500,
  expirationDate: new Date('2025-12-18'),
  daysRemaining: 30,
};

await sendExpirationNotificationUseCase.execute(
  'user-123',
  expiringPoints,
  NotificationType.EXPIRATION_30_DAYS,
);
```

### Example 2: Checking User Preference

```typescript
const user = await prisma.user.findUnique({
  where: { id: 'user-123' },
  select: { emailNotifications: true },
});

if (!user?.emailNotifications) {
  console.log('User has opted out of notifications');
}
```

### Example 3: Querying Notification Statistics

```typescript
// Get statistics for last 24 hours
const logs = await prisma.notificationLog.findMany({
  where: {
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  },
});

const stats = {
  total: logs.length,
  sent: logs.filter(l => l.status === 'SENT').length,
  failed: logs.filter(l => l.status === 'FAILED').length,
  skipped: logs.filter(l => l.status === 'SKIPPED').length,
};

console.log('Last 24h stats:', stats);
```

## Future Enhancements (Phase 2+)

Potential improvements deferred from Phase 1:

- **Multi-Language Support:** Spanish and other language templates
- **User Time Zone:** Send notifications at user-preferred local time
- **Advanced Preferences:** Granular notification type selection, frequency settings
- **One-Click Unsubscribe:** Token-based unsubscribe without login
- **Email Tracking:** Open rate and click-through rate tracking
- **SNS Webhooks:** Automated bounce/complaint handling from AWS
- **Admin Dashboard:** Analytics and metrics visualization
- **Multiple Channels:** SMS, push notifications, in-app notifications
- **Point Redemption:** Direct redemption from email with secured links
- **Dynamic Recommendations:** Personalized product/business suggestions

## Troubleshooting

See the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for common issues and solutions.

## Contributing

When modifying this module:

1. Follow DDD principles (domain → application → infrastructure)
2. Maintain test coverage at 70%+ baseline, 90%+ for critical logic
3. Update this README if adding new services or changing workflows
4. Update email templates with Handlebars syntax only
5. Test AWS SES changes with mocked SES (never send real test emails)

## References

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Handlebars Template Guide](https://handlebarsjs.com/)
- [Prisma Query Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/crud)
- [NestJS Schedule Module](https://docs.nestjs.com/techniques/task-scheduling)
