import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';

/**
 * Template Rendering Test Suite
 *
 * This test suite verifies that all email templates:
 * 1. Are properly formatted and valid
 * 2. Render correctly with Handlebars variable substitution
 * 3. Include all required variables for each template tier
 * 4. Are responsive and compatible with email clients
 */
describe('Email Template Rendering', () => {
  const templateDir = path.join(__dirname, '..');

  const sampleVariables = {
    userName: 'Test User',
    pointsExpiring: 500,
    expirationDate: 'December 31, 2025',
    currentBalance: 1000,
    daysRemaining: 30,
    walletUrl: 'https://rewards-bolivia.local/wallet',
    unsubscribeUrl: 'https://rewards-bolivia.local/preferences',
  };

  describe('30-day expiration template', () => {
    it('should load and compile 30-day HTML template', async () => {
      const templatePath = path.join(templateDir, 'expiration-30-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);

      // Should compile without errors
      const template = Handlebars.compile(content);
      expect(typeof template).toBe('function');
    });

    it('should render 30-day HTML template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-30-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);
      const rendered = template(sampleVariables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('1000');
      expect(rendered).toContain('https://rewards-bolivia.local/wallet');
      expect(rendered).toContain('https://rewards-bolivia.local/preferences');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify HTML structure
      expect(rendered).toContain('<!DOCTYPE html>');
      expect(rendered).toContain('<html');
      expect(rendered).toContain('</html>');
    });

    it('should load and compile 30-day plain text template', async () => {
      const templatePath = path.join(templateDir, 'expiration-30-days.txt');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);

      // Should compile without errors
      const template = Handlebars.compile(content);
      expect(typeof template).toBe('function');
    });

    it('should render 30-day plain text template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-30-days.txt');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);
      const rendered = template(sampleVariables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('1000');
      expect(rendered).toContain('https://rewards-bolivia.local/wallet');
      expect(rendered).toContain('https://rewards-bolivia.local/preferences');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify plain text formatting
      expect(rendered).toContain('REWARDS BOLIVIA');
      expect(rendered).not.toContain('<!DOCTYPE');
      expect(rendered).not.toContain('<html>');
    });
  });

  describe('7-day expiration template', () => {
    it('should load and compile 7-day HTML template', async () => {
      const templatePath = path.join(templateDir, 'expiration-7-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);

      // Should compile without errors
      const template = Handlebars.compile(content);
      expect(typeof template).toBe('function');
    });

    it('should render 7-day HTML template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-7-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);

      const variables = {
        ...sampleVariables,
        daysRemaining: 7,
      };

      const rendered = template(variables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('1000');
      expect(rendered).toContain('7');
      expect(rendered).toContain('https://rewards-bolivia.local/wallet');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify increased urgency in messaging
      expect(rendered.toLowerCase()).toMatch(/urgent|only|days left|soon/);
    });

    it('should render 7-day plain text template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-7-days.txt');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);

      const variables = {
        ...sampleVariables,
        daysRemaining: 7,
      };

      const rendered = template(variables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('7');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify urgency
      expect(rendered).toContain('URGENT');
    });
  });

  describe('1-day expiration template', () => {
    it('should load and compile 1-day HTML template', async () => {
      const templatePath = path.join(templateDir, 'expiration-1-day.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(0);

      // Should compile without errors
      const template = Handlebars.compile(content);
      expect(typeof template).toBe('function');
    });

    it('should render 1-day HTML template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-1-day.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);

      const variables = {
        ...sampleVariables,
        daysRemaining: 1,
      };

      const rendered = template(variables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('1000');
      expect(rendered).toContain('1');
      expect(rendered).toContain('https://rewards-bolivia.local/wallet');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify maximum urgency in messaging
      expect(rendered.toLowerCase()).toMatch(/last chance|today|do not delay|immediately|expiring today/);
    });

    it('should render 1-day plain text template with all variables substituted', async () => {
      const templatePath = path.join(templateDir, 'expiration-1-day.txt');
      const content = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(content);

      const variables = {
        ...sampleVariables,
        daysRemaining: 1,
      };

      const rendered = template(variables);

      // Verify all variables are substituted
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('500');
      expect(rendered).toContain('December 31, 2025');
      expect(rendered).toContain('1');

      // Verify no unsubstituted variables remain
      expect(rendered).not.toMatch(/\{\{[^}]+\}\}/);

      // Verify maximum urgency
      expect(rendered).toContain('LAST CHANCE');
      expect(rendered).toContain('DO NOT DELAY');
    });
  });

  describe('Template structure validation', () => {
    const templates = [
      'expiration-30-days.hbs',
      'expiration-7-days.hbs',
      'expiration-1-day.hbs',
    ];

    templates.forEach((templateFile) => {
      it(`should have valid HTML structure in ${templateFile}`, async () => {
        const templatePath = path.join(templateDir, templateFile);
        const content = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(content);
        const rendered = template(sampleVariables);

        // Verify HTML structure
        expect(rendered).toContain('<!DOCTYPE html>');
        expect(rendered).toContain('<html');
        expect(rendered).toContain('</html>');
        expect(rendered).toContain('<head>');
        expect(rendered).toContain('</head>');
        expect(rendered).toContain('<body>');
        expect(rendered).toContain('</body>');

        // Verify required sections
        expect(rendered).toContain('email-container');
        expect(rendered).toContain('Rewards Bolivia');
        expect(rendered).toMatch(/wallet|redeem/i);
      });
    });

    const textTemplates = [
      'expiration-30-days.txt',
      'expiration-7-days.txt',
      'expiration-1-day.txt',
    ];

    textTemplates.forEach((templateFile) => {
      it(`should be readable plain text in ${templateFile}`, async () => {
        const templatePath = path.join(templateDir, templateFile);
        const content = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(content);
        const rendered = template(sampleVariables);

        // Verify no HTML tags
        expect(rendered).not.toContain('<!DOCTYPE');
        expect(rendered).not.toContain('<html');
        expect(rendered).not.toContain('<body');

        // Verify readable formatting
        expect(rendered.split('\n').length).toBeGreaterThan(5);
        expect(rendered).toContain('REWARDS BOLIVIA');

        // Verify links are plain text URLs
        expect(rendered).toMatch(/https:\/\//);
      });
    });
  });

  describe('Required variables validation', () => {
    it('should include all required variables in 30-day template', async () => {
      const templatePath = path.join(templateDir, 'expiration-30-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Check for all required variables
      const requiredVars = [
        'userName',
        'pointsExpiring',
        'expirationDate',
        'currentBalance',
        'walletUrl',
        'unsubscribeUrl',
      ];

      requiredVars.forEach((variable) => {
        expect(content).toContain(`{{${variable}}}`);
      });
    });

    it('should include all required variables in 7-day template', async () => {
      const templatePath = path.join(templateDir, 'expiration-7-days.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Check for all required variables including daysRemaining
      const requiredVars = [
        'userName',
        'pointsExpiring',
        'expirationDate',
        'currentBalance',
        'daysRemaining',
        'walletUrl',
        'unsubscribeUrl',
      ];

      requiredVars.forEach((variable) => {
        expect(content).toContain(`{{${variable}}}`);
      });
    });

    it('should include all required variables in 1-day template', async () => {
      const templatePath = path.join(templateDir, 'expiration-1-day.hbs');
      const content = await fs.readFile(templatePath, 'utf-8');

      // Check for all required variables including daysRemaining
      const requiredVars = [
        'userName',
        'pointsExpiring',
        'expirationDate',
        'currentBalance',
        'daysRemaining',
        'walletUrl',
        'unsubscribeUrl',
      ];

      requiredVars.forEach((variable) => {
        expect(content).toContain(`{{${variable}}}`);
      });
    });
  });

  describe('Urgency progression', () => {
    it('should progressively increase urgency from 30-day to 1-day templates', async () => {
      const templates = [
        { file: 'expiration-30-days.hbs', tier: '30-day' },
        { file: 'expiration-7-days.hbs', tier: '7-day' },
        { file: 'expiration-1-day.hbs', tier: '1-day' },
      ];

      for (const { file } of templates) {
        const templatePath = path.join(templateDir, file);
        const content = await fs.readFile(templatePath, 'utf-8');

        // All should have basic structure
        expect(content).toContain('Rewards Bolivia');
      }

      // 7-day should have more urgency than 30-day
      const thirtyDayContent = await fs.readFile(
        path.join(templateDir, 'expiration-30-days.hbs'),
        'utf-8',
      );
      const sevenDayContent = await fs.readFile(
        path.join(templateDir, 'expiration-7-days.hbs'),
        'utf-8',
      );
      const oneDayContent = await fs.readFile(
        path.join(templateDir, 'expiration-1-day.hbs'),
        'utf-8',
      );

      // 1-day should have "LAST CHANCE" or "TODAY"
      expect(
        oneDayContent.toLowerCase().includes('last chance') ||
          oneDayContent.includes('TODAY'),
      ).toBe(true);

      // 7-day should have urgency markers
      expect(
        sevenDayContent.toLowerCase().includes('urgent') ||
          sevenDayContent.toLowerCase().includes('only'),
      ).toBe(true);

      // 30-day should be more casual
      expect(thirtyDayContent.toLowerCase()).toMatch(/perfect time|soon/);
    });
  });
});
