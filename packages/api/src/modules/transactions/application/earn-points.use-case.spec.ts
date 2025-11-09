import { Test, TestingModule } from '@nestjs/testing';
import { EarnPointsUseCase } from './earn-points.use-case';
import { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { TransactionEventPublisher } from './services/transaction-event.publisher';
import { TransactionType } from '@prisma/client';

describe('EarnPointsUseCase', () => {
  let useCase: EarnPointsUseCase;
  let transactionRepository: ITransactionRepository;
  let eventPublisher: TransactionEventPublisher;

  const mockTransactionRepository = {
    create: jest.fn(),
  };

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockEventPublisher = {
    publishTransactionCompleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EarnPointsUseCase,
        {
          provide: 'ITransactionRepository',
          useValue: mockTransactionRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: TransactionEventPublisher,
          useValue: mockEventPublisher,
        },
      ],
    }).compile();

    useCase = module.get<EarnPointsUseCase>(EarnPointsUseCase);
    transactionRepository = module.get<ITransactionRepository>(
      'ITransactionRepository',
    );
    eventPublisher = module.get<TransactionEventPublisher>(
      TransactionEventPublisher,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw an error if business is not found or has insufficient balance', async () => {
      (new HttpException(
        'Business not found or insufficient points balance',
        HttpStatus.BAD_REQUEST,
      ),
        mockPrismaService.business.findUnique.mockResolvedValue({
          id: '1',
          pointsBalance: 50,
        }));
      await expect(
        useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1'),
      ).rejects.toThrow(
        new HttpException(
          'Business not found or insufficient points balance',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if customer is not found', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: '1',
        pointsBalance: 200,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1'),
      ).rejects.toThrow(
        new HttpException('Customer not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should create a transaction and return the result', async () => {
      const business = { id: '1', pointsBalance: 200 };
      const customer = { id: '1', name: 'Test Customer', pointsBalance: 100 };
      const transaction = {
        id: '1',
        pointsAmount: 100,
        status: 'COMPLETED',
        type: TransactionType.EARN,
      };

      mockPrismaService.business.findUnique.mockResolvedValue(business);
      mockPrismaService.user.findUnique.mockResolvedValue(customer);
      mockTransactionRepository.create.mockResolvedValue(transaction);
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...customer,
        pointsBalance: 200,
      }); // Updated balance
      mockPrismaService.business.findUnique.mockResolvedValue({
        ...business,
        pointsBalance: 100,
      }); // Updated balance

      const result = await useCase.execute(
        { customerId: '1', purchaseAmount: 100 },
        '1',
      );

      expect(transactionRepository.create).toHaveBeenCalledWith({
        type: TransactionType.EARN,
        pointsAmount: 100,
        status: 'COMPLETED',
        auditHash: expect.any(String),
        businessId: '1',
        customerId: '1',
      });
      expect(eventPublisher.publishTransactionCompleted).toHaveBeenCalledWith({
        transaction: transaction,
      });
      expect(result).toEqual({
        transactionId: transaction.id,
        status: transaction.status,
        pointsEarned: transaction.pointsAmount,
        newCustomerBalance: 200,
        businessName: business.name,
      });
    });
  });
});
