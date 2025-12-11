# Email Template Customization Guide

This guide explains how to customize email notification templates for the Point Expiration Notification system. Templates are managed using Handlebars template syntax and stored as `.hbs` (HTML) and `.txt` (plain text) files.

## Template Location

All email templates are located in:

```
packages/api/src/modules/notifications/infrastructure/templates/
```

## Template Files

Six templates exist (3 notification tiers × 2 formats):

### 30-Day Warning (User has 30 days remaining)
- `expiration-30-days.hbs` - HTML version
- `expiration-30-days.txt` - Plain text version
- **Purpose:** Informative first reminder about upcoming expiration
- **Tone:** Not urgent, informative

### 7-Day Warning (User has 7 days remaining)
- `expiration-7-days.hbs` - HTML version
- `expiration-7-days.txt` - Plain text version
- **Purpose:** Increased urgency reminder
- **Tone:** "Only 7 days left" messaging with moderate urgency

### 1-Day Warning (User has 1 day remaining)
- `expiration-1-day.hbs` - HTML version
- `expiration-1-day.txt` - Plain text version
- **Purpose:** Final reminder, last chance to redeem
- **Tone:** Maximum urgency: "Last Chance" or "Expiring Tomorrow"

## Template Variables Reference

All templates have access to these variables:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `userName` | string | User's first name or full name | "John Doe" |
| `pointsExpiring` | number | Number of points expiring on the date | 500 |
| `expirationDate` | string | Formatted expiration date | "December 18, 2025" |
| `currentBalance` | number | User's total current point balance | 1250 |
| `daysRemaining` | number | Days until expiration | 30, 7, or 1 |
| `walletUrl` | string | Deep link to wallet dashboard | "https://rewards.app/wallet" |

### Variable Usage in Templates

Variables are accessed using Handlebars `{{double-curly-brace}}` syntax:

```handlebars
Hello {{userName}},

You have {{pointsExpiring}} points expiring on {{expirationDate}}.
Current balance: {{currentBalance}} points.
Days remaining: {{daysRemaining}} days.

View your wallet: {{walletUrl}}
```

## Handlebars Syntax Reference

### Basic Variable Substitution

```handlebars
{{variable}}
```

Replaces with the variable value. If variable is undefined/null, outputs empty string.

### Conditionals

```handlebars
{{#if condition}}
  <p>This is shown if condition is true</p>
{{else}}
  <p>This is shown if condition is false</p>
{{/if}}
```

Example with point balance:
```handlebars
{{#if currentBalance > 1000}}
  <p>Your balance is healthy: {{currentBalance}} points</p>
{{else}}
  <p>Consider earning more points: {{currentBalance}} points</p>
{{/if}}
```

### Loops (for arrays)

```handlebars
{{#each items}}
  <li>{{this}}</li>
{{/each}}
```

### Comments

```handlebars
{{!-- This is a comment and won't appear in output --}}
```

### Custom Helpers

For advanced formatting:
- `{{capitalize variable}}` - Capitalizes first letter
- `{{uppercase variable}}` - Converts to uppercase
- `{{lowercase variable}}` - Converts to lowercase

## Customizing HTML Templates

### HTML Template Structure

HTML templates should follow standard transactional email best practices:

1. **Doctype and Meta Tags**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <style>
       /* Inline styles for email compatibility */
     </style>
   </head>
   <body>
     <!-- Email content -->
   </body>
   </html>
   ```

2. **Email Client Compatibility**
   - Use inline styles (style attributes) instead of `<style>` tags
   - Email clients strip out `<style>` tags or have limited support
   - Use tables for layout (more reliable than divs across email clients)
   - Test in Gmail, Outlook, Apple Mail

3. **Responsive Design**
   - Include `<meta name="viewport">` for mobile rendering
   - Use CSS media queries for responsive behavior
   - Test on mobile devices (narrow screens)
   - Aim for 600px width maximum for email content

4. **Company Branding**
   - Include company logo/header
   - Use brand colors (CSS color codes)
   - Include company footer with contact info
   - Add unsubscribe link (links to settings page)

### HTML Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    .footer { background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rewards Bolivia</h1>
    </div>

    <div class="content">
      <p>Hi {{userName}},</p>
      <p>Your {{pointsExpiring}} Rewards Bolivia points are expiring on {{expirationDate}}!</p>
      <p>Current balance: {{currentBalance}} points</p>
      <p>
        <a href="{{walletUrl}}" class="button">View Your Wallet</a>
      </p>
    </div>

    <div class="footer">
      <p><a href="{{walletUrl}}#preferences" style="color: white;">Manage Notification Preferences</a></p>
      <p>&copy; 2025 Rewards Bolivia. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Customizing Plain Text Templates

Plain text templates should be simple and readable, without any HTML markup.

### Plain Text Template Example

```
Rewards Bolivia

Hi {{userName}},

Your {{pointsExpiring}} Rewards Bolivia points are expiring on {{expirationDate}}.

Current balance: {{currentBalance}} points
Days remaining: {{daysRemaining}}

View your wallet and redeem your points:
{{walletUrl}}

Manage your notification preferences:
{{walletUrl}}#preferences

Questions? Visit our support page for more information.

--
Rewards Bolivia Team
© 2025 Rewards Bolivia. All rights reserved.
```

## Best Practices for Email Templates

### Content Guidelines

1. **Clear Subject Line**
   - Subject is set by the application, not the template
   - Current: "Your Rewards Bolivia Points Are Expiring Soon"
   - Keep subject concise and descriptive

2. **Personalization**
   - Always use `{{userName}}` for personalized greeting
   - Increases engagement and looks more professional
   - Creates emotional connection

3. **Urgency Progression**
   - 30-day: "Points expiring in 30 days"
   - 7-day: "Only 7 days left to redeem"
   - 1-day: "Last chance - expiring tomorrow"
   - Don't overstate urgency for 30-day warning

4. **Clear Call-to-Action**
   - Use prominent button or link for wallet
   - Make it visually distinct
   - Use action-oriented text: "View Wallet", "Redeem Now", "Act Now"

5. **Unsubscribe Link**
   - Required by CAN-SPAM regulations
   - Links to settings page: `{{walletUrl}}#preferences`
   - Place in footer
   - Use plain language: "Manage Notification Preferences"

### Design Guidelines

1. **Email Client Compatibility**
   - Test rendering in Gmail, Outlook, Apple Mail
   - Use email preview tools (Litmus, Email on Acid)
   - Avoid cutting-edge CSS (limited support in email)

2. **Mobile Responsiveness**
   - Stack content vertically on small screens
   - Use readable font size (14px minimum)
   - Ensure links/buttons are finger-friendly (44px+ height)
   - Test on iPhone, Android devices

3. **Accessible Design**
   - Use sufficient color contrast (WCAG AA minimum)
   - Include alt text for images
   - Structure with semantic HTML (h1, h2, p tags)
   - Don't rely solely on color to convey meaning

4. **Loading and Performance**
   - Keep email size under 100KB
   - Optimize images (compress, resize)
   - Minimize inline CSS
   - Avoid large image files

### Security Guidelines

1. **Never Include Sensitive Data**
   - Don't include full email addresses in template
   - Don't include passwords or tokens
   - Don't include credit card information
   - Only include non-sensitive user identifiers

2. **Safe Link Handling**
   - Always use HTTPS URLs
   - Validate URLs in application before inserting
   - Avoid query parameters with sensitive data
   - Use deep links instead of search queries

3. **No External Resources**
   - Avoid loading CSS/JavaScript from external URLs
   - Use inline styles only
   - Avoid dynamic content loading
   - Email clients may block external requests

## Testing Template Changes

### Local Testing

1. **Template Syntax Validation**
   ```bash
   # Check template compilation
   pnpm test notifications
   ```

2. **Render Test with Sample Data**
   ```typescript
   import { NotificationBuilderService } from './application/services/notification-builder.service';

   const service = new NotificationBuilderService();
   const { html, text } = await service.renderEmailContent('expiration-30-days', {
     userName: 'John Doe',
     pointsExpiring: 500,
     expirationDate: 'December 18, 2025',
     currentBalance: 1250,
     daysRemaining: 30,
     walletUrl: 'http://localhost:5173/wallet',
   });

   console.log('HTML:', html);
   console.log('Text:', text);
   ```

3. **Visual Inspection**
   - Copy rendered HTML into email preview tool
   - Use browser developer tools to inspect styling
   - Check for broken variables ({{ notRender }} in output)
   - Verify links work correctly

### Email Client Testing

1. **Test Multiple Email Clients**
   - Gmail (web and mobile app)
   - Outlook (web and desktop)
   - Apple Mail
   - Yahoo Mail
   - Mobile clients (Gmail app, Apple Mail app)

2. **Email Preview Services**
   - Use Litmus Email Testing
   - Use Email on Acid
   - Use Mailtrap for local testing
   - These services render your template in 70+ email clients

3. **Real Email Testing**
   - Send to personal email addresses (Gmail, Outlook, etc.)
   - Check inbox vs spam folder
   - Verify all links work
   - Check image loading
   - Check mobile rendering

### Automated Testing

Create tests to verify template rendering:

```typescript
describe('Email Templates', () => {
  it('should render 30-day template with all variables', async () => {
    const { html, text } = await notificationBuilderService.renderEmailContent(
      'expiration-30-days',
      {
        userName: 'Test User',
        pointsExpiring: 500,
        expirationDate: 'December 18, 2025',
        currentBalance: 1250,
        daysRemaining: 30,
        walletUrl: 'http://localhost:5173/wallet',
      },
    );

    expect(html).toContain('Test User');
    expect(html).toContain('500');
    expect(html).toContain('December 18, 2025');
    expect(html).toContain('http://localhost:5173/wallet');
    expect(text).toContain('Test User');
  });
});
```

## Making Template Changes

### Step-by-Step Guide

1. **Edit the Template File**
   - Open `.hbs` or `.txt` file in editor
   - Make desired changes
   - Verify Handlebars syntax is correct
   - Save file

2. **Test Locally**
   - Run `pnpm test notifications` to catch syntax errors
   - Use NotificationBuilderService to render with sample data
   - Review rendered output for correctness

3. **Preview in Email Clients**
   - Copy HTML output to email preview tool
   - Test in Gmail, Outlook, Apple Mail
   - Check mobile rendering
   - Verify links work

4. **Commit Changes**
   - Commit template changes to git
   - Use descriptive commit message: "refactor(templates): improve 7-day warning copy"

5. **Deploy**
   - Deploy code to staging environment
   - Send test notification to staging email addresses
   - Verify rendering in real email clients
   - Monitor production for email quality issues

6. **Monitor After Deployment**
   - Check AWS SES bounce/complaint rates
   - Monitor NotificationLog for failures
   - Gather user feedback on email quality
   - Be prepared to revert changes if issues arise

### Common Customizations

#### Change Company Name
Replace "Rewards Bolivia" with your actual company name throughout templates.

#### Update Brand Colors
Change color codes in HTML templates:
- Primary: `#007bff` (blue) → Your brand color
- Dark: `#333` (dark gray) → Your brand dark color
- Light: `#f9f9f9` (light gray) → Your brand light color

#### Add Company Logo
Include image in HTML template:
```html
<img src="https://your-domain.com/logo.png" alt="Company Logo" style="max-width: 200px;">
```

#### Customize CTA Button Text
Change "View Your Wallet" to other text:
- "Redeem Now"
- "Check Your Points"
- "Go to Dashboard"
- "View Available Rewards"

#### Adjust Tone/Messaging
Modify urgency levels:
- 30-day: Keep informative, add "don't miss out" messaging
- 7-day: Increase urgency, emphasize time-sensitive nature
- 1-day: Maximum urgency, use "last chance" language

## Troubleshooting Template Issues

### Template Variables Not Rendering

**Problem:** Email contains `{{variableName}}` instead of actual value

**Solutions:**
1. Check variable name spelling matches exactly (case-sensitive)
2. Verify variable is passed from NotificationBuilderService
3. Check NotificationBuilderService has variable in context
4. Review test to ensure variable is being provided

### Email Not Rendering Correctly

**Problem:** HTML email displays incorrectly in email client

**Solutions:**
1. Check for CSS syntax errors (email clients have limited CSS support)
2. Use inline styles instead of `<style>` tags
3. Test in multiple email clients (rendering varies)
4. Use email preview service to identify client-specific issues
5. Simplify CSS - remove unsupported properties

### Links Not Working

**Problem:** Links in email don't navigate when clicked

**Solutions:**
1. Verify URL is valid and complete (https://, not relative paths)
2. Check walletUrl environment variable is set correctly
3. Test link directly in browser
4. Check email client isn't wrapping or breaking URL
5. Use URL encoding if URL contains special characters

### Characters Display Incorrectly

**Problem:** Special characters (é, ñ, etc.) display as ?

**Solutions:**
1. Ensure file encoding is UTF-8
2. Verify `<meta charset="UTF-8">` in HTML template
3. Check template rendering uses UTF-8 encoding
4. Test in multiple email clients

### Template Syntax Error on Deployment

**Problem:** Template compile error during deployment

**Solutions:**
1. Check Handlebars syntax for unclosed tags
2. Verify all `{{#if}}` blocks have `{{/if}}`
3. Verify all `{{#each}}` blocks have `{{/each}}`
4. Check for extra/missing curly braces
5. Run local tests to catch errors before deployment

## Performance Considerations

### Template Rendering Performance

- Templates are compiled and cached after first use
- Rendering is typically <100ms per template
- Inline styles are preferred over external stylesheets
- Avoid complex Handlebars logic (keeps rendering fast)

### Email Size Impact

- Target email size: <50KB (HTML + plain text combined)
- Keep images small and optimized
- Use CSS compression if inline styles are complex
- Avoid large image attachments

## References

- [Handlebars Official Documentation](https://handlebarsjs.com/)
- [Email on Acid Template Testing](https://www.emailonacid.com/)
- [Litmus Email Testing](https://www.litmus.com/)
- [CAN-SPAM Act Compliance](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide)
- [Email Client CSS Support](https://www.campaignmonitor.com/css/)

## Support

For questions about template customization:

1. Review this guide and Handlebars documentation
2. Check test files in `infrastructure/templates/__tests__/` for examples
3. Review existing templates for patterns and best practices
4. Test changes thoroughly in local environment before deploying
5. Contact team if issues arise
