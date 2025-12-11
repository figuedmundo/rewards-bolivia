import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { LoggerService } from '@rewards-bolivia/logger';
import { isValidEmail } from '../utils/email-validator';

/**
 * EmailService handles sending transactional emails via AWS SES
 * Features:
 * - Email validation before sending
 * - Rate limiting (configurable emails/second)
 * - Exponential backoff retry logic for temporary failures
 * - Error handling distinguishing temporary vs permanent failures
 */
@Injectable()
export class EmailService {
  private readonly logger = new LoggerService('EmailService');
  private readonly sesClient: SESClient;
  private readonly fromEmail: string;
  private readonly rateLimit: number;
  private readonly maxRetries = 3;

  // Rate limiting: track send times to throttle requests
  private sendTimes: number[] = [];

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_SES_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });

    this.fromEmail = process.env.AWS_SES_FROM_EMAIL || 'noreply@rewards-bolivia.com';
    this.rateLimit = parseInt(process.env.NOTIFICATION_RATE_LIMIT || '14', 10);
  }

  /**
   * Sends a transactional email via AWS SES with rate limiting and retry logic
   * @param to Recipient email address
   * @param subject Email subject line
   * @param htmlBody HTML content of the email
   * @param textBody Plain text content of the email
   * @throws BadRequestException if email address is invalid
   * @throws Error if email fails after max retries
   */
  async sendTransactionalEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
  ): Promise<void> {
    // Validate email address first
    if (!isValidEmail(to)) {
      this.logger.error('Invalid email address', {
        email: to,
        reason: 'invalid email format',
      });
      throw new BadRequestException('Invalid email address format');
    }

    // Apply rate limiting
    await this.applyRateLimit();

    // Send email with retry logic
    await this.sendWithRetry(to, subject, htmlBody, textBody);
  }

  /**
   * Internal method to send email with exponential backoff retry logic
   * @param to Recipient email address
   * @param subject Email subject
   * @param htmlBody HTML content
   * @param textBody Plain text content
   * @param attempt Current attempt number (for exponential backoff calculation)
   */
  private async sendWithRetry(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string,
    attempt: number = 1,
  ): Promise<void> {
    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: 'UTF-8',
            },
            Text: {
              Data: textBody,
              Charset: 'UTF-8',
            },
          },
        },
      });

      const response = await this.sesClient.send(command);
      this.logger.debug('Email sent successfully', {
        to,
        messageId: response.MessageId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any).code || 'Unknown';

      // Distinguish temporary vs permanent failures
      const isTemporaryFailure = this.isTemporaryFailure(errorCode);

      if (isTemporaryFailure && attempt < this.maxRetries) {
        // Exponential backoff: 2^attempt * 1000ms (1s, 2s, 4s)
        const backoffDelay = Math.pow(2, attempt - 1) * 1000;
        this.logger.warn('Temporary email failure, retrying with backoff', {
          to,
          attempt,
          nextRetryIn: backoffDelay,
          error: errorMessage,
        });

        await this.delay(backoffDelay);
        return this.sendWithRetry(to, subject, htmlBody, textBody, attempt + 1);
      }

      // Permanent failure or max retries exceeded
      this.logger.error('Failed to send email', {
        to,
        subject,
        attempt,
        isTemporaryFailure,
        error: errorMessage,
        errorCode,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  }

  /**
   * Determines if an error is temporary (should retry) or permanent (should not retry)
   * @param errorCode AWS SES error code
   * @returns true if error is temporary, false otherwise
   */
  private isTemporaryFailure(errorCode: string): boolean {
    // Temporary/retryable AWS SES errors
    const temporaryErrors = [
      'Throttling',
      'RequestLimitExceeded',
      'ServiceUnavailable',
      'TemporaryFailure',
    ];

    return temporaryErrors.includes(errorCode);
  }

  /**
   * Applies rate limiting to prevent exceeding AWS SES sending quotas
   * Limits to configured emails per second (default: 14 emails/sec)
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // Remove old timestamps outside the 1-second window
    this.sendTimes = this.sendTimes.filter((time) => time > oneSecondAgo);

    // Check if we've hit the rate limit
    if (this.sendTimes.length >= this.rateLimit) {
      // Calculate how long to wait
      const oldestTime = this.sendTimes[0];
      const waitTime = 1000 - (now - oldestTime) + 10; // +10ms buffer

      if (waitTime > 0) {
        this.logger.debug('Rate limit reached, waiting', {
          waitTime,
          sentInLastSecond: this.sendTimes.length,
          limit: this.rateLimit,
        });
        await this.delay(waitTime);
      }
    }

    // Record this send time
    this.sendTimes.push(Date.now());
  }

  /**
   * Helper method to delay execution for specified milliseconds
   * @param ms Milliseconds to delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
