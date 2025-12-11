# AWS SES Setup Guide

This guide helps you set up Amazon Simple Email Service (SES) for the Rewards Bolivia application.

## Prerequisites

- An AWS Account
- Access to the AWS Console

## Step 1: Create AWS SES Account & Verify Domain (Task 12.1)

1.  Log in to the [AWS Console](https://console.aws.amazon.com/ses/).
2.  Navigate to **Amazon Simple Email Service**.
3.  Click **Identities** -> **Create identity**.
4.  Select **Domain**.
5.  Enter your domain (e.g., `rewards-bolivia.com` or a subdomain).
6.  Follow the instructions to add the CNAME records to your DNS provider (Route53, GoDaddy, etc.) for DKIM verification.
7.  Wait for the verification status to change to "Verified".

## Step 2: Verify Sender Email (Task 12.2)

If you cannot verify the entire domain yet, or want to use a specific address:

1.  Go to **Identities** -> **Create identity**.
2.  Select **Email address**.
3.  Enter `notifications@rewards-bolivia.com` (or the email you plan to use).
4.  Check the inbox for that email and click the verification link sent by AWS.

## Step 3: Create IAM User (Task 12.5)

1.  Navigate to **IAM** in the AWS Console.
2.  Click **Users** -> **Create user**.
3.  Name: `rewards-bolivia-ses-user`.
4.  Permissions options: **Attach policies directly**.
5.  Search for and select `AmazonSESFullAccess` (or create a custom policy allowing `ses:SendEmail` and `ses:SendRawEmail`).
6.  Create the user.
7.  Go to the user's **Security credentials** tab.
8.  Create an **Access key** (Select "Application running outside AWS" or "Local code").
9.  Copy the **Access Key ID** and **Secret Access Key**.

## Step 4: Configure Environment Variables

Update your `.env` file in the project root:

```bash
AWS_SES_REGION=us-east-1  # or your selected region
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_SES_FROM_EMAIL=notifications@rewards-bolivia.com
```

## Step 5: Test Email Sending (Task 12.7)

Run the test script to verify your configuration:

```bash
pnpm --filter api exec ts-node -r tsconfig-paths/register scripts/test-ses-email.ts <your-verified-email@example.com>
```

**Note for Sandbox Mode:**
If your account is still in SES Sandbox mode (default for new accounts), you can **only** send emails to addresses that you have verified in the SES Console (Step 2).

## Step 6: Move to Production (Task 12.3)

To send to any email address:
1.  Go to **Account dashboard** in SES Console.
2.  Click **Request production access**.
3.  Fill in the details about your use case (Transactional emails for loyalty program).
4.  Wait for AWS approval (usually 24 hours).

## Step 7: Configure Rate Limits (Task 12.4)

1.  Check your sending limits in **Account dashboard**.
2.  Update `NOTIFICATION_RATE_LIMIT` in `.env` to match your allowed rate (e.g., 14 emails/second).
