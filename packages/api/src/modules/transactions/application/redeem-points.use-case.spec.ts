import { Test, TestingModule } from '@nestjs/testing';
import { RedeemPointsUseCase } from './redeem-points.use-case';
import { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('RedeemPointsUseCase', () => {
  let useCase: RedeemPointsUseCase;
  let transactionRepository: ITransactionRepository;

  const mockTransactionRepository = {
    redeem: jest.fn(),
    create: jest.fn(),
  };

  const mockPrismaService = {
    business: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedeemPointsUseCase,
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
      ],
    }).compile();

    useCase = module.get<RedeemPointsUseCase>(RedeemPointsUseCase);
    transactionRepository = module.get<ITransactionRepository>(
      'ITransactionRepository',
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw an error if customer is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(
        useCase.execute(
          { businessId: '1', pointsToRedeem: 100, ticketTotal: 500 },
          '1',
        ),
      ).rejects.toThrow(
        new HttpException('Customer not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if customer has insufficient balance', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        pointsBalance: 50,
      });
      await expect(
        useCase.execute(
          { businessId: '1', pointsToRedeem: 100, ticketTotal: 500 },
          '1',
        ),
      ).rejects.toThrow(
        new HttpException(
          'Insufficient points balance',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if business is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        pointsBalance: 200,
      });
      mockPrismaService.business.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute(
          { businessId: '1', pointsToRedeem: 100, ticketTotal: 500 },
          '1',
        ),
      ).rejects.toThrow(
        new HttpException('Business not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error if redemption value exceeds 30% of ticket total', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        pointsBalance: 4000,
      });
      mockPrismaService.business.findUnique.mockResolvedValue({
        id: '1',
        name: 'Test Business',
      });

      await expect(
        useCase.execute(
          { businessId: '1', pointsToRedeem: 3001, ticketTotal: 100 },
          '1',
        ),
      ).rejects.toThrow(
        new HttpException(
          'Redemption value exceeds 30% of ticket total',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should create a transaction and return the result', async () => {
      const business = { id: '1', name: 'Test Business', pointsBalance: 5000 };
      const updatedBusiness = { ...business, pointsBalance: 5100 };
      const customer = { id: '1', pointsBalance: 200 };
      const updatedCustomer = { ...customer, pointsBalance: 100 };
      const transaction = { id: '1', pointsAmount: 100, status: 'COMPLETED' };

      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(customer)
        .mockResolvedValueOnce(updatedCustomer);
      mockPrismaService.business.findUnique
        .mockResolvedValueOnce(business)
        .mockResolvedValueOnce(updatedBusiness);
      mockTransactionRepository.redeem.mockResolvedValue(transaction as any);

      const result = await useCase.execute(
        { businessId: '1', pointsToRedeem: 100, ticketTotal: 400 },
        '1',
      );

      expect(transactionRepository.redeem).toHaveBeenCalled();
      expect(result).toEqual({
        transactionId: transaction.id,
        status: transaction.status,
        pointsRedeemed: transaction.pointsAmount,
        discountValueBs: '3.00',
        newCustomerBalance: updatedCustomer.pointsBalance,
        businessName: business.name,
      });
    });
  });
});
