import { Test, TestingModule } from '@nestjs/testing';
import { LedgerHashService } from './ledger-hash.service';
import { PointLedger } from '@prisma/client';
import { createHash } from 'crypto';

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

  const createMockEntry = (overrides?: Partial<PointLedger>): PointLedger => {
    const now = new Date();
    return {
      id: 'clx123mockid',
      type: 'EARN',
      accountId: 'user_abc',
      debit: 0,
      credit: 100,
      balanceAfter: 100,
      reason: 'Test reason',
      hash: null,
      createdAt: now,
      transactionId: 'tx_xyz',
      ...overrides,
    };
  };

  it('should compute deterministic hash for same input', () => {
    const entry = createMockEntry();
    const hash1 = service.computeEntryHash(entry);
    const hash2 = service.computeEntryHash(entry);
    expect(hash1).toBe(hash2);
  });

  it('should compute different hash for different inputs', () => {
    const entry1 = createMockEntry({ debit: 100, credit: 0, balanceAfter: 100 });
    const entry2 = createMockEntry({ debit: 0, credit: 200, balanceAfter: 200 });
    const hash1 = service.computeEntryHash(entry1);
    const hash2 = service.computeEntryHash(entry2);
    expect(hash1).not.toBe(hash2);
  });

  it('should verify valid hash', () => {
    const entry = createMockEntry();
    entry.hash = service.computeEntryHash(entry);
    expect(service.verifyEntryHash(entry)).toBe(true);
  });

  it('should reject invalid hash', () => {
    const entry = createMockEntry();
    entry.hash = 'invalid_hash';
    expect(service.verifyEntryHash(entry)).toBe(false);
  });

  it('should return false if entry hash is null', () => {
    const entry = createMockEntry();
    entry.hash = null;
    expect(service.verifyEntryHash(entry)).toBe(false);
  });

  it('should compute hash for new entry data with a timestamp', () => {
    const newEntryData = {
      id: 'new_id',
      type: 'ADJUSTMENT',
      accountId: 'user_def',
      debit: 50,
      credit: 0,
      balanceAfter: 50,
      transactionId: 'tx_uvw',
    };
    const { hash, timestamp } = service.computeHashForNewEntry(newEntryData);
    expect(hash).toBeDefined();
    expect(timestamp).toBeInstanceOf(Date);

    const expectedData = `${newEntryData.id}|${newEntryData.type}|${newEntryData.accountId}|${newEntryData.debit}|${newEntryData.credit}|${newEntryData.balanceAfter}|${newEntryData.transactionId}|${timestamp.toISOString()}`;
    const expectedHash = createHash('sha256').update(expectedData).digest('hex');
    expect(hash).toBe(expectedHash);
  });

  it('should compute different hash for new entries with different timestamps', () => {
    jest.useFakeTimers();

    const newEntryData = {
      id: 'new_id',
      type: 'ADJUSTMENT',
      accountId: 'user_def',
      debit: 50,
      credit: 0,
      balanceAfter: 50,
      transactionId: 'tx_uvw',
    };

    jest.setSystemTime(new Date('2025-01-01T10:00:00Z'));
    const { hash: hash1 } = service.computeHashForNewEntry(newEntryData);

    jest.setSystemTime(new Date('2025-01-01T10:00:01Z')); // 1 second later
    const { hash: hash2 } = service.computeHashForNewEntry(newEntryData);

    expect(hash1).not.toBe(hash2);
    jest.useRealTimers(); // Restore real timers
  });
});