import { EmailService } from '../src/modules/notifications/application/services/email.service';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
const envPath = resolve(__dirname, '../../../.env'); // Root .env
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

async function main() {
  const toEmail = process.argv[2];

  if (!toEmail) {
    console.error('\nUsage: pnpm --filter api exec ts-node -r tsconfig-paths/register scripts/test-ses-email.ts <email>');
    console.error('Example: pnpm --filter api exec ts-node -r tsconfig-paths/register scripts/test-ses-email.ts my-email@example.com\n');
    process.exit(1);
  }

  console.log(`\n📧 Sending test email to: ${toEmail}`);
  console.log(`🌍 AWS Region: ${process.env.AWS_SES_REGION}`);
  console.log(`📨 Sender Email: ${process.env.AWS_SES_FROM_EMAIL}`);

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
     console.error('❌ Error: AWS credentials are not set in .env file.');
     console.error('Please configure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in the root .env file.');
     process.exit(1);
  }

  // Instantiate EmailService directly
  // Note: dependencies like LoggerService are instantiated internally in the constructor
  const emailService = new EmailService();

  try {
    const subject = 'Test Email from Rewards Bolivia';
    const htmlBody = `
      <h1>Rewards Bolivia Email Test</h1>
      <p>This is a test email sent from the Rewards Bolivia API.</p>
      <p>If you are reading this, your <strong>AWS SES configuration is correct</strong>! ✅</p>
      <hr>
      <p><small>Timestamp: ${new Date().toISOString()}</small></p>
    `;
    const textBody = `Rewards Bolivia Email Test\n\nThis is a test email sent from the Rewards Bolivia API.\nIf you are reading this, your AWS SES configuration is correct! ✅\n\nTimestamp: ${new Date().toISOString()}`;

    console.log('🚀 Attempting to send email...');
    await emailService.sendTransactionalEmail(
      toEmail,
      subject,
      htmlBody,
      textBody
    );
    console.log('✅ Email sent successfully!');
    console.log('Check your inbox (and spam folder) for the message.');
  } catch (error) {
    console.error('❌ Failed to send email:');
    if (error instanceof Error) {
        console.error(`Error Message: ${error.message}`);
        console.error('Stack Trace:', error.stack);
    } else {
        console.error(error);
    }
    
    // Provide troubleshooting hints based on common errors
    const errString = String(error);
    if (errString.includes('MessageRejected') || errString.includes('Email address is not verified')) {
        console.error('\n💡 Tip: In AWS SES Sandbox mode, you can ONLY send to verified email addresses.');
        console.error('   Please verify the recipient email in the AWS SES Console.');
    } else if (errString.includes('InvalidClientTokenId') || errString.includes('SignatureDoesNotMatch')) {
        console.error('\n💡 Tip: Check your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    }
    
    process.exit(1);
  }
}

main();
