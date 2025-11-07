import { test, expect } from '@playwright/test';
import { PrismaClient, User, Business } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Using .serial to enforce a sequential execution order for this end-to-end user journey.
// This ensures that tests run in the defined order, which is crucial for a stateful flow
// where each step depends on the previous one (e.g., earning points before redeeming them).
test.describe.serial('E2E User Journey: Customer Earns and Redeems Points', () => {
  let customer: User;
  let businessOwner: User;
  let business: Business;
  let authToken: string;

  // STEP 0: SETUP - Executed once before all tests in this suite.
  // We create all the necessary entities for our test scenario:
  // 1. A Business Owner (User)
  // 2. A Customer (User)
  // 3. A Business, owned by the Business Owner.
  test.beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create a business owner user
    businessOwner = await prisma.user.create({
      data: {
        email: `business-owner-${Date.now()}@test.com`,
        passwordHash: hashedPassword,
        role: 'business',
      },
    });

    // Create a customer user
    customer = await prisma.user.create({
      data: {
        email: `customer-${Date.now()}@test.com`,
        passwordHash: hashedPassword,
        role: 'customer',
      },
    });

    // Create a business associated with the business owner and give it an initial point balance
    business = await prisma.business.create({
      data: {
        name: 'Test Business for E2E',
        owner: {
          connect: {
            id: businessOwner.id,
          },
        },
        pointsBalance: 1000, // FIX: Give the business points to award
      },
    });
  });

  // STEP 4: TEARDOWN - Executed once after all tests.
  // Cleans up the database by deleting all created records to ensure test isolation
  // and prevent data pollution for subsequent test runs.
  test.afterAll(async () => {
    // Clean up in reverse order of creation to respect foreign key constraints
    await prisma.pointLedger.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.business.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  // STEP 1: AUTHENTICATION
  // The customer logs in to obtain an authentication token required for subsequent actions.
  test('Step 1: Customer should be able to log in', async ({ request }) => {
    // Arrange: Prepare login credentials
    const loginPayload = {
      email: customer.email,
      password: 'password123',
    };

    // Act: Send a POST request to the login endpoint
    const loginResponse = await request.post('/api/auth/login', {
      data: loginPayload,
    });

    // Assert: Verify the login was successful
    expect(loginResponse.status()).toBe(200);
    const { accessToken } = await loginResponse.json();
    expect(accessToken).toBeDefined();

    // Store the auth token for the next steps in the journey
    authToken = accessToken;
  });


  // STEP 2: EARN POINTS
  // The business owner initiates a transaction to grant points to a customer.
  test('Step 2: Business should be able to grant points to a customer', async ({ request }) => {
    // Arrange: Authenticate as the Business Owner to get a token
    const loginResponse = await request.post('/api/auth/login', {
        data: {
            email: businessOwner.email,
            password: 'password123',
        },
    });
    expect(loginResponse.status()).toBe(200);
    const { accessToken } = await loginResponse.json();
    const businessAuthToken = accessToken;

    // Arrange: Prepare the data for the "earn points" transaction
    const earnPayload = {
      customerId: customer.id,
      purchaseAmount: 100,
      businessId: business.id, // DTO requires this field
    };

    // Act: Send a POST request to the "earn" endpoint using the business's token
    const earnResponse = await request.post('/api/transactions/earn', {
      headers: {
        Authorization: `Bearer ${businessAuthToken}`,
      },
      data: earnPayload,
    });

    // Assert: Verify the API response
    expect(earnResponse.status()).toBe(201);
    const earnData = await earnResponse.json();
    expect(earnData.pointsEarned).toBe(100);

    // Assert: Verify the database state
    // 1. Check that the transaction was recorded
    const transaction = await prisma.transaction.findFirst({
      where: {
        customerId: customer.id,
        businessId: business.id,
        pointsAmount: 100,
      },
    });
    expect(transaction).not.toBeNull();

    // 2. Check that the customer's point balance was updated
    const updatedCustomer = await prisma.user.findUnique({
      where: {
        id: customer.id,
      },
    });
    expect(updatedCustomer?.pointsBalance).toBe(100);
  });

  // STEP 3: REDEEM POINTS
  // The customer uses their earned points to get a discount or reward.
  test('Step 3: Customer should be able to redeem points', async ({ request }) => {
    // Pre-condition: Ensure the user is authenticated
    expect(authToken).toBeDefined();

    // Arrange: Check that the customer has enough points to redeem
    const customerBeforeRedeem = await prisma.user.findUnique({
      where: { id: customer.id },
    });
    expect(customerBeforeRedeem?.pointsBalance).toBeGreaterThanOrEqual(25);

    // Arrange: Prepare the data for the "redeem points" transaction
    const redeemPayload = {
      businessId: business.id,
      pointsToRedeem: 25,
      ticketTotal: 50,
    };

    const burnRate = 0.005; // From EconomicControlService
    const expectedBurnAmount = Math.floor(redeemPayload.pointsToRedeem * burnRate);
    const expectedBusinessCredit = redeemPayload.pointsToRedeem - expectedBurnAmount;

    // Act: Send a POST request to the "redeem" endpoint
    const redeemResponse = await request.post('/api/transactions/redeem', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: redeemPayload,
    });

    // Assert: Verify the API response
    expect(redeemResponse.status()).toBe(201);
    const redeemData = await redeemResponse.json();
    expect(redeemData.pointsRedeemed).toBe(25);

    // Assert: Verify the database state
    // 1. Check that the redemption transaction was recorded
    const transaction = await prisma.transaction.findFirst({
      where: {
        customerId: customer.id,
        businessId: business.id,
        pointsAmount: -25, // Redemption is recorded as a negative point value
      },
    });
    expect(transaction).not.toBeNull();
    expect(transaction!.burnAmount).toBe(expectedBurnAmount);

    const burnLedgerEntry = await prisma.pointLedger.findFirst({
      where: { transactionId: transaction!.id, accountId: 'SYSTEM_BURN_ACCOUNT', credit: expectedBurnAmount },
    });
    expect(burnLedgerEntry).toBeDefined();

    // 2. Check that the customer's point balance was correctly debited
    const updatedCustomer = await prisma.user.findUnique({
      where: { id: customer.id },
    });
    expect(updatedCustomer?.pointsBalance).toBe(75); // Initial 100 - 25 redeemed = 75

    // 3. Check that the business's point balance was correctly credited (minus burn)
    const updatedBusiness = await prisma.business.findUnique({
      where: { id: business.id },
    });
    expect(updatedBusiness?.pointsBalance).toBe(1000 + expectedBusinessCredit); // Initial 1000 + (25 - burnAmount)
  });
});
