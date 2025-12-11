import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LoggerService } from '@rewards-bolivia/logger';

/**
 * HandlebarsTemplate type for compiled templates
 */
type HandlebarsTemplate = (variables: Record<string, any>) => string;

/**
 * Email content result from template rendering
 */
export interface EmailContent {
  html: string;
  text: string;
}

/**
 * NotificationBuilderService handles email template loading, compilation, and rendering
 * Features:
 * - Handlebars template support with variable substitution
 * - Template caching for performance
 * - Support for HTML and plain text templates
 * - Comprehensive variable support for all notification tiers
 */
@Injectable()
export class NotificationBuilderService {
  private readonly logger = new LoggerService('NotificationBuilderService');
  private readonly templateCache = new Map<string, HandlebarsTemplate>();
  private readonly templateDir: string;

  constructor() {
    // Templates directory relative to this file
    this.templateDir = path.join(
      __dirname,
      '../../../../modules/notifications/infrastructure/templates',
    );
  }

  /**
   * Renders email content (HTML and plain text) from a template
   * @param templateName Name of the template (e.g., 'expiration-30-days')
   * @param variables Object containing template variables
   * @returns Promise resolving to {html, text} email content
   * @throws Error if template not found or rendering fails
   */
  async renderEmailContent(
    templateName: string,
    variables: Record<string, any>,
  ): Promise<EmailContent> {
    try {
      // Load HTML template
      const htmlTemplate = await this.loadTemplate(templateName);
      const html = htmlTemplate(variables);

      // Try to load plain text template
      let text = '';
      try {
        const textTemplate = await this.loadTemplate(`${templateName}.txt`);
        text = textTemplate(variables);
      } catch (error) {
        // If .txt template not found, generate plain text from HTML
        this.logger.debug(
          'Plain text template not found, using fallback conversion',
          { templateName },
        );
        text = this.stripHtmlTags(html);
      }

      return { html, text };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to render email content', {
        templateName,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Loads and compiles a Handlebars template from disk
   * Returns cached compiled template if available for performance
   * @param templateName Name of the template file (without extension, or with .hbs/.txt)
   * @returns Promise resolving to compiled Handlebars template function
   * @throws Error if template file not found
   */
  async loadTemplate(templateName: string): Promise<HandlebarsTemplate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      this.logger.debug('Using cached template', { templateName });
      return this.templateCache.get(templateName)!;
    }

    try {
      // Determine file name
      let fileName = templateName;
      if (!fileName.endsWith('.hbs') && !fileName.endsWith('.txt')) {
        fileName = `${templateName}.hbs`;
      }

      const filePath = path.join(this.templateDir, fileName);

      // Read template file
      const templateContent = await fs.readFile(filePath, 'utf-8');

      // Compile with Handlebars
      const compiled = Handlebars.compile(templateContent);

      // Cache the compiled template
      this.templateCache.set(templateName, compiled);

      this.logger.debug('Template loaded and compiled', { templateName });

      return compiled;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to load template', {
        templateName,
        error: errorMessage,
      });
      throw error;
    }
  }

  /**
   * Clears the template cache
   * Useful for testing or forcing template reload
   */
  clearCache(): void {
    this.templateCache.clear();
    this.logger.debug('Template cache cleared');
  }

  /**
   * Strips HTML tags from content to create plain text fallback
   * @param html HTML content
   * @returns Plain text without HTML tags
   */
  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }
}
