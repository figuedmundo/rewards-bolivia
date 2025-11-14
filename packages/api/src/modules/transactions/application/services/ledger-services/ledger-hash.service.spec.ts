import { Test, TestingModule } from '@nestjs/testing';
import { LedgerHashService } from './ledger-hash.service';
import { LedgerEntryType, PointLedger } from '@prisma/client';

const createMockEntry = (overrides: Partial<PointLedger> = {}): PointLedger => {
  return {
    id: 'clx123abc',
    type: LedgerEntryType.EARN,
    accountId: 'user123',
    debit: 0,
    credit: 100,
    balanceAfter: 100,
    reason: 'Test',
    hash: null,
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
    transactionId: 'tx123',
    ...overrides,
  };
};

describe('LedgerHashService', () => {
  let service: LedgerHashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LedgerHashService],
    }).compile();

    service = module.get<LedgerHashService>(LedgerHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute a deterministic hash for the same input', () => {
    const entry = createMockEntry();
    const hash1 = service.computeEntryHash(entry);
    const hash2 = service.computeEntryHash(entry);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should compute a different hash for different inputs', () => {
    const entry1 = createMockEntry({ debit: 100 });
    const entry2 = createMockEntry({ debit: 200 });
    const hash1 = service.computeEntryHash(entry1);
    const hash2 = service.computeEntryHash(entry2);
    expect(hash1).not.toBe(hash2);
  });

  it('should verify a valid hash', () => {
    const entry = createMockEntry();
    entry.hash = service.computeEntryHash(entry);
    expect(service.verifyEntryHash(entry)).toBe(true);
  });

  it('should reject an invalid hash', () => {
    const entry = createMockEntry();
    entry.hash = 'invalid_hash';
    expect(service.verifyEntryHash(entry)).toBe(false);
  });

  it('should return false when verifying an entry with no hash', () => {
    const entry = createMockEntry();
    expect(service.verifyEntryHash(entry)).toBe(false);
  });

  it('should compute a hash for a new entry and return it with a timestamp', () => {
    const newEntryData = {
      id: 'new_id',
      type: 'REDEEM',
      accountId: 'user456',
      debit: 50,
      credit: 0,
      balanceAfter: 50,
      transactionId: 'tx456',
    };
    const result = service.computeHashForNewEntry(newEntryData);
    expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should complete hash computation in <10ms', () => {
    const entry = createMockEntry();
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      service.computeEntryHash(entry);
    }

    const end = performance.now();
    const avgTime = (end - start) / 100;

    console.log(`Average hash computation time: ${avgTime.toFixed(4)}ms`);
    expect(avgTime).toBeLessThan(10);
  });
});
