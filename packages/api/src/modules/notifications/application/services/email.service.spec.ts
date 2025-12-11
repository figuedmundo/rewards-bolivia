import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

jest.mock('@aws-sdk/client-ses');

describe('EmailService', () => {
  let service: EmailService;
  let mockSESClient: jest.Mocked<SESClient>;

  beforeEach(async () => {
    // Clear environment variables
    delete process.env.AWS_SES_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_SES_FROM_EMAIL;
    delete process.env.NOTIFICATION_RATE_LIMIT;

    // Set test environment variables
    process.env.AWS_SES_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_SES_FROM_EMAIL = 'test@rewards-bolivia.com';
    process.env.NOTIFICATION_RATE_LIMIT = '14';

    mockSESClient = {
      send: jest.fn().mockResolvedValue({ MessageId: 'test-message-id' }),
    } as any;

    (SESClient as jest.MockedClass<typeof SESClient>).mockImplementation(
      () => mockSESClient,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTransactionalEmail', () => {
    it('should send email via AWS SES', async () => {
      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        htmlBody: '<html><body>Test HTML</body></html>',
        textBody: 'Test text',
      };

      await service.sendTransactionalEmail(
        emailParams.to,
        emailParams.subject,
        emailParams.htmlBody,
        emailParams.textBody,
      );

      expect(mockSESClient.send).toHaveBeenCalled();
      const callArgs = mockSESClient.send.mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(SendEmailCommand);
    });

    it('should reject invalid email addresses', async () => {
      const invalidEmail = 'not-an-email';

      await expect(
        service.sendTransactionalEmail(
          invalidEmail,
          'Subject',
          '<html></html>',
          'text',
        ),
      ).rejects.toThrow();
    });

    it('should retry on temporary AWS SES failures with exponential backoff', async () => {
      let callCount = 0;
      mockSESClient.send = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          const error = new Error('Throttling: Maximum sending rate exceeded');
          (error as any).code = 'Throttling';
          throw error;
        }
        return Promise.resolve({ MessageId: 'success-id' });
      });

      const emailParams = {
        to: 'user@example.com',
        subject: 'Test Subject',
        htmlBody: '<html></html>',
        textBody: 'text',
      };

      await service.sendTransactionalEmail(
        emailParams.to,
        emailParams.subject,
        emailParams.htmlBody,
        emailParams.textBody,
      );

      // Should retry and eventually succeed
      expect(mockSESClient.send).toHaveBeenCalledTimes(2);
    });

    it('should respect rate limiting by queuing requests', async () => {
      process.env.NOTIFICATION_RATE_LIMIT = '10'; // 10 emails per second for faster test

      // Create new service instance with updated env var
      const testService = new EmailService();
      mockSESClient.send = jest.fn().mockResolvedValue({
        MessageId: 'msg-id',
      });
      (SESClient as jest.MockedClass<typeof SESClient>).mockImplementation(
        () => mockSESClient,
      );

      // Send 2 emails sequentially - should be fast since within rate limit
      const startTime = Date.now();

      await testService.sendTransactionalEmail(
        'user1@example.com',
        'Subject 1',
        '<html>1</html>',
        'text 1',
      );

      await testService.sendTransactionalEmail(
        'user2@example.com',
        'Subject 2',
        '<html>2</html>',
        'text 2',
      );

      const elapsedTime = Date.now() - startTime;

      // Should complete quickly since 2 emails at 10/sec limit = <1 second
      expect(elapsedTime).toBeLessThan(1000);
      expect(mockSESClient.send).toHaveBeenCalledTimes(2);
    });
  });
});
