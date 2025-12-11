import { Test, TestingModule } from '@nestjs/testing';
import { NotificationBuilderService } from './notification-builder.service';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock the file system
jest.mock('fs/promises');

describe('NotificationBuilderService', () => {
  let service: NotificationBuilderService;
  const mockFsPromises = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationBuilderService],
    }).compile();

    service = module.get<NotificationBuilderService>(NotificationBuilderService);

    // Setup mock file reads for HTML templates only
    mockFsPromises.readFile.mockImplementation(async (filePath: any) => {
      const fileName = path.basename(filePath as string);

      if (fileName === 'expiration-30-days.hbs') {
        return 'Hello {{userName}}, Your {{pointsExpiring}} points expire on {{expirationDate}}.';
      } else if (fileName === 'expiration-7-days.hbs') {
        return 'Urgent: {{userName}}, only {{daysRemaining}} days left! {{pointsExpiring}} points expire soon.';
      } else if (fileName === 'expiration-1-day.hbs') {
        return 'LAST CHANCE: {{userName}}, {{daysRemaining}} day remaining! Redeem {{pointsExpiring}} points now!';
      }

      // Reject for non-existent templates or txt variants
      throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
    });
  });

  describe('renderEmailContent', () => {
    it('should render HTML template with all variables substituted correctly', async () => {
      const variables = {
        userName: 'John Doe',
        pointsExpiring: 500,
        expirationDate: 'December 31, 2025',
        currentBalance: 1000,
        daysRemaining: 30,
        walletUrl: 'https://rewards-bolivia.com/wallet',
      };

      const result = await service.renderEmailContent(
        'expiration-30-days',
        variables,
      );

      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('500');
      expect(result.html).toContain('December 31, 2025');
      expect(result.text).toBeDefined();
    });

    it('should render 7-day template with proper variable substitution', async () => {
      const variables = {
        userName: 'Jane Smith',
        pointsExpiring: 250,
        expirationDate: 'December 20, 2025',
        currentBalance: 2000,
        daysRemaining: 7,
        walletUrl: 'https://rewards-bolivia.com/wallet',
      };

      const result = await service.renderEmailContent(
        'expiration-7-days',
        variables,
      );

      expect(result.html).toContain('Jane Smith');
      expect(result.html).toContain('7');
      expect(result.html).toContain('250');
    });

    it('should render 1-day template with all required variables', async () => {
      const variables = {
        userName: 'Bob Johnson',
        pointsExpiring: 100,
        expirationDate: 'December 1, 2025',
        currentBalance: 500,
        daysRemaining: 1,
        walletUrl: 'https://rewards-bolivia.com/wallet',
      };

      const result = await service.renderEmailContent(
        'expiration-1-day',
        variables,
      );

      expect(result.html).toContain('Bob Johnson');
      expect(result.html).toContain('1');
      expect(result.html).toContain('100');
    });

    it('should handle template rendering errors gracefully', async () => {
      mockFsPromises.readFile.mockRejectedValueOnce(
        new Error('ENOENT: no such file'),
      );

      const variables = {
        userName: 'Test User',
        pointsExpiring: 100,
        expirationDate: 'Jan 1, 2026',
        currentBalance: 500,
        daysRemaining: 7,
        walletUrl: 'https://test.com',
      };

      await expect(
        service.renderEmailContent('non-existent', variables),
      ).rejects.toThrow();
    });

    it('should generate fallback plain text from HTML when txt template missing', async () => {
      const variables = {
        userName: 'Test User',
        pointsExpiring: 100,
        expirationDate: 'Jan 1, 2026',
        currentBalance: 500,
        daysRemaining: 7,
        walletUrl: 'https://test.com',
      };

      const result = await service.renderEmailContent(
        'expiration-30-days',
        variables,
      );

      // Text should be generated from HTML
      expect(result.text).toBeTruthy();
      expect(result.text.length > 0).toBe(true);
      // Should not contain HTML tags
      expect(result.text).not.toMatch(/<[^>]*>/);
    });
  });

  describe('loadTemplate', () => {
    it('should load and compile Handlebars template', async () => {
      const template = await service.loadTemplate('expiration-30-days');

      expect(template).toBeDefined();
      expect(typeof template).toBe('function');
    });

    it('should throw error for non-existent template', async () => {
      mockFsPromises.readFile.mockRejectedValueOnce(
        new Error('ENOENT: no such file'),
      );

      await expect(service.loadTemplate('does-not-exist')).rejects.toThrow();
    });
  });
});
