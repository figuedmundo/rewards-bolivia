/**
 * AWS SES Mock Helper
 * Provides utilities to mock AWS SES client for testing without sending real emails
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

/**
 * Mock sent emails storage for testing
 */
export class MockSESStore {
  private sentEmails: Array<{
    to: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    timestamp: Date;
  }> = [];

  /**
   * Record a sent email
   */
  recordEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
  ) {
    this.sentEmails.push({
      to,
      subject,
      htmlBody,
      textBody,
      timestamp: new Date(),
    });
  }

  /**
   * Get all sent emails
   */
  getAllEmails() {
    return [...this.sentEmails];
  }

  /**
   * Get emails sent to a specific recipient
   */
  getEmailsTo(email: string) {
    return this.sentEmails.filter((e) => e.to === email);
  }

  /**
   * Get emails by subject pattern
   */
  getEmailsBySubject(pattern: string | RegExp) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.sentEmails.filter((e) => regex.test(e.subject));
  }

  /**
   * Check if email was sent to recipient
   */
  wasEmailSentTo(email: string): boolean {
    return this.sentEmails.some((e) => e.to === email);
  }

  /**
   * Get email count
   */
  count(): number {
    return this.sentEmails.length;
  }

  /**
   * Clear all recorded emails
   */
  clear() {
    this.sentEmails = [];
  }

  /**
   * Get last email sent
   */
  getLastEmail() {
    return this.sentEmails[this.sentEmails.length - 1] || null;
  }

  /**
   * Get emails with content matching pattern
   */
  getEmailsWithContent(pattern: string | RegExp) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return this.sentEmails.filter(
      (e) => regex.test(e.htmlBody) || regex.test(e.textBody),
    );
  }
}

/**
 * Setup AWS SES mock for Jest tests
 */
export function setupSesMock(): {
  store: MockSESStore;
  mockSESClient: jest.Mocked<SESClient>;
} {
  const store = new MockSESStore();

  // Mock the SES client
  const mockSESClient = {
    send: jest.fn().mockImplementation(async (command: SendEmailCommand) => {
      // Extract email details from the command
      const input = (command as any).input;

      if (input && input.Destination && input.Message) {
        const to = input.Destination.ToAddresses?.[0] || '';
        const subject = input.Message.Subject?.Data || '';
        const htmlBody = input.Message.Body?.Html?.Data || '';
        const textBody = input.Message.Body?.Text?.Data || '';

        // Record in our mock store
        store.recordEmail(to, subject, htmlBody, textBody);
      }

      // Return success response
      return Promise.resolve({
        MessageId: `msg-${Date.now()}`,
      });
    }),
  } as unknown as jest.Mocked<SESClient>;

  return {
    store,
    mockSESClient,
  };
}

/**
 * Assert that an email was sent to a recipient
 */
export function assertEmailSentTo(store: MockSESStore, email: string) {
  const sent = store.wasEmailSentTo(email);
  if (!sent) {
    throw new Error(`Expected email to be sent to ${email}, but it was not`);
  }
}

/**
 * Assert that no email was sent to a recipient
 */
export function assertEmailNotSentTo(store: MockSESStore, email: string) {
  const sent = store.wasEmailSentTo(email);
  if (sent) {
    throw new Error(`Expected no email to be sent to ${email}, but it was`);
  }
}

/**
 * Assert email count
 */
export function assertEmailCount(store: MockSESStore, expectedCount: number) {
  const actual = store.count();
  if (actual !== expectedCount) {
    throw new Error(
      `Expected ${expectedCount} emails to be sent, but ${actual} were sent`,
    );
  }
}
