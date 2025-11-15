import { Test, TestingModule } from '@nestjs/testing';
import { LedgerCreationHelper } from './ledger-creation.helper';
import { PrismaService } from '@/infrastructure/prisma.service';
import { LedgerHashService } from './ledger-hash.service';
import { Prisma, PointLedger } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

// Mock the entire @paralleldrive/cuid2 module
jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(() => 'mocked_cuid'),
}));

// Import the mocked createId function
import { createId } from '@paralleldrive/cuid2';

describe('LedgerCreationHelper', () => {
  let helper: LedgerCreationHelper;
  let prisma: DeepMockProxy<PrismaService>;
  let ledgerHashService: DeepMockProxy<LedgerHashService>;

  beforeEach(async () => {
    // Reset the mock before each test
    (createId as jest.Mock).mockClear();
    (createId as jest.Mock).mockReturnValue('mocked_cuid'); // Set default mock value

    prisma = mockDeep<PrismaService>();
    ledgerHashService = mockDeep<LedgerHashService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerCreationHelper,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: LedgerHashService,
          useValue: ledgerHashService,
        },
      ],
    }).compile();

    helper = module.get<LedgerCreationHelper>(LedgerCreationHelper);
  });

  it('should be defined', () => {
    expect(helper).toBeDefined();
  });

  it('should create a ledger entry with a computed hash and generated ID/timestamp', async () => {
    const mockDate = new Date();
    const mockHash = 'mocked_hash';
    const mockCuid = 'mocked_cuid'; // This will be the default from jest.mock

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    // No need to mock cuid here, it's already mocked globally
    ledgerHashService.computeHashForNewEntry.mockReturnValue({ hash: mockHash, timestamp: mockDate });

    const createInput: Omit<Prisma.PointLedgerCreateInput, 'hash' | 'id' | 'createdAt'> = {
      type: 'EARN',
      accountId: 'user123',
      debit: 0,
      credit: 100,
      balanceAfter: 100,
      transaction: { connect: { id: 'tx456' } },
    };

    const expectedCreatedEntry: PointLedger = {
      ...createInput,
      id: mockCuid,
      hash: mockHash,
      createdAt: mockDate,
      reason: null, // Prisma default for optional fields
      transactionId: 'tx456',
    };

    prisma.pointLedger.create.mockResolvedValue(expectedCreatedEntry);

    const result = await helper.createLedgerEntry(createInput);

    expect(createId).toHaveBeenCalledTimes(1); // Verify createId was called
    expect(ledgerHashService.computeHashForNewEntry).toHaveBeenCalledWith({
      id: mockCuid,
      type: createInput.type,
      accountId: createInput.accountId,
      debit: createInput.debit,
      credit: createInput.credit,
      balanceAfter: createInput.balanceAfter,
      transactionId: createInput.transaction.connect.id,
    });

    expect(prisma.pointLedger.create).toHaveBeenCalledWith({
      data: {
        ...createInput,
        id: mockCuid,
        hash: mockHash,
        createdAt: mockDate,
      },
    });

    expect(result).toEqual(expectedCreatedEntry);
  });

  it('should use provided transaction client if available', async () => {
    const mockDate = new Date();
    const mockHash = 'mocked_hash';
    const mockCuid = 'mocked_cuid'; // This will be the default from jest.mock

    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    // No need to mock cuid here
    ledgerHashService.computeHashForNewEntry.mockReturnValue({ hash: mockHash, timestamp: mockDate });

    const createInput: Omit<Prisma.PointLedgerCreateInput, 'hash' | 'id' | 'createdAt'> = {
      type: 'REDEEM',
      accountId: 'user789',
      debit: 50,
      credit: 0,
      balanceAfter: 50,
      transaction: { connect: { id: 'tx101' } },
    };

    const mockTxClient = mockDeep<Prisma.TransactionClient>();
    const expectedCreatedEntry: PointLedger = {
      ...createInput,
      id: mockCuid,
      hash: mockHash,
      createdAt: mockDate,
      reason: null,
      transactionId: 'tx101',
    };
    mockTxClient.pointLedger.create.mockResolvedValue(expectedCreatedEntry);

    const result = await helper.createLedgerEntry(createInput, mockTxClient);

    expect(createId).toHaveBeenCalledTimes(1); // Verify createId was called
    expect(mockTxClient.pointLedger.create).toHaveBeenCalledWith({
      data: {
        ...createInput,
        id: mockCuid,
        hash: mockHash,
        createdAt: mockDate,
      },
    });
    expect(prisma.pointLedger.create).not.toHaveBeenCalled(); // Ensure default client is not used
    expect(result).toEqual(expectedCreatedEntry);
  });
});