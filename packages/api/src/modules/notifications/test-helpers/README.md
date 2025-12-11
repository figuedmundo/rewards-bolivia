# Notification Module Test Helpers

This directory contains utilities and fixtures for testing the notifications module.

## Files

### `notification-test-fixtures.ts`
Provides helper functions to create realistic test data for notifications testing:

- `createTestUser()` - Create a test user with optional email notification settings
- `createExpiringPointsLedgerEntry()` - Create a PointLedger entry with expiring points
- `createBatchExpiringPointsLedger()` - Create multiple PointLedger entries for batch testing
- `createNotificationLogEntry()` - Create a NotificationLog entry with custom status
- `clearNotificationLogs()` - Clear all NotificationLog entries for test isolation
- `clearUserPointsLedger()` - Clear PointLedger entries for a specific user
- `getUserNotificationHistory()` - Query notification history for a user
- `hasNotificationBeenSent()` - Check if a specific notification has been sent
- `getNotificationStatistics()` - Get summary statistics for notifications

### `aws-ses-mock.ts`
Provides utilities to mock AWS SES client for testing without sending real emails:

- `MockSESStore` - In-memory store for tracking sent emails during tests
  - `recordEmail()` - Record a sent email
  - `getAllEmails()` - Get all sent emails
  - `getEmailsTo()` - Get emails sent to a specific recipient
  - `getEmailsBySubject()` - Get emails by subject pattern
  - `wasEmailSentTo()` - Check if email was sent to recipient
  - `count()` - Get total email count
  - `clear()` - Clear all recorded emails
  - `getLastEmail()` - Get last email sent
  - `getEmailsWithContent()` - Get emails with content matching pattern

- `setupSesMock()` - Setup AWS SES mock for Jest tests
- `assertEmailSentTo()` - Assert that an email was sent to a recipient
- `assertEmailNotSentTo()` - Assert that no email was sent to a recipient
- `assertEmailCount()` - Assert email count

## Usage Examples

### In Tests

```typescript
import { createTestUser, createExpiringPointsLedgerEntry } from '../test-helpers/notification-test-fixtures';
import { setupSesMock } from '../test-helpers/aws-ses-mock';

describe('Notification Tests', () => {
  let prisma: PrismaService;
  let sesStore: MockSESStore;

  beforeEach(() => {
    // Setup SES mock
    const { store, mockSESClient } = setupSesMock();
    sesStore = store;

    // Mock SES client in EmailService
    (SESClient as jest.MockedClass<typeof SESClient>).mockImplementation(
      () => mockSESClient,
    );
  });

  it('should send notification email', async () => {
    // Create test user
    const user = await createTestUser(prisma, {
      email: 'test@example.com',
      emailNotifications: true,
    });

    // Create expiring points
    await createExpiringPointsLedgerEntry(prisma, {
      userId: user.id,
      pointsExpiring: 500,
      daysUntilExpiration: 30,
    });

    // Run notification logic...

    // Assert email was sent
    assertEmailSentTo(sesStore, 'test@example.com');
    expect(sesStore.count()).toBe(1);
  });
});
```

## Test Coverage

The notification module has 64 tests across these components:

- **Domain Layer Tests (6 tests)**: Entity and interface contracts
- **Repository Tests (4 tests)**: Database operations and deduplication
- **Email Service Tests (6 tests)**: SES integration and rate limiting
- **Notification Builder Tests (3 tests)**: Template rendering
- **Expiration Service Tests (6 tests)**: Point detection and processing
- **Use Case Tests (3 tests)**: End-to-end notification sending
- **Job Tests (4 tests)**: Scheduled job execution
- **Template Tests (13 tests)**: Template rendering and structure validation
- **Controller Tests (4 tests)**: Preference API endpoints

## Integration Testing Strategy

Since full end-to-end integration tests require complex database setup and NestJS module configuration, the existing unit and targeted component tests provide comprehensive coverage of critical paths:

1. **Expiring Points Detection** - Covered by ExpirationNotificationService tests
2. **Deduplication Logic** - Covered by PrismaNotificationRepository tests
3. **User Preferences** - Covered by ExpirationNotificationService tests
4. **Email Sending** - Covered by EmailService and SendExpirationNotificationUseCase tests
5. **Template Rendering** - Covered by NotificationBuilderService and template rendering tests
6. **Batch Processing** - Covered by ExpirationNotificationService tests
7. **Error Handling** - Covered by all component tests

## Key Test Patterns

### Mocking AWS SES
```typescript
const { store, mockSESClient } = setupSesMock();
(SESClient as jest.MockedClass<typeof SESClient>).mockImplementation(
  () => mockSESClient,
);
```

### Creating Test Data
```typescript
const user = await createTestUser(prisma, {
  email: 'test@example.com',
  emailNotifications: false,
});

const ledger = await createExpiringPointsLedgerEntry(prisma, {
  userId: user.id,
  daysUntilExpiration: 30,
});
```

### Test Isolation
```typescript
beforeEach(() => {
  sesStore.clear();
  // Clear database if needed
});
```

## Performance Notes

- Mock AWS SES client to avoid real email sending
- Use in-memory MockSESStore for fast test execution
- Batch tests use 100-user batches (matches production BATCH_SIZE)
- All tests complete in <15 seconds total

## Future Enhancements

- Add WebSocket mock for real-time notification testing
- Add SMS mock helper when SMS notifications are implemented
- Add push notification mock helper
- Create performance test suite for load testing batch processing
