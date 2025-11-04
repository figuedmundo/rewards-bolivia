import { Test, TestingModule } from '@nestjs/testing';
import { EarnPointsUseCase } from './earn-points.use-case';
import { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('EarnPointsUseCase', () => {
  let useCase: EarnPointsUseCase;
  let transactionRepository: ITransactionRepository;
  let prismaService: PrismaService;

  const mockTransactionRepository = {
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
      ],
    }).compile();

    useCase = module.get<EarnPointsUseCase>(EarnPointsUseCase);
    transactionRepository = module.get<ITransactionRepository>('ITransactionRepository');
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw an error if business is not found or has insufficient balance', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue(null);
      await expect(useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1')).rejects.toThrow(
        new HttpException('Insufficient business points balance', HttpStatus.BAD_REQUEST),
      );

      mockPrismaService.business.findUnique.mockResolvedValue({ id: '1', pointsBalance: 50 });
      await expect(useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1')).rejects.toThrow(
        new HttpException('Insufficient business points balance', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an error if customer is not found', async () => {
      mockPrismaService.business.findUnique.mockResolvedValue({ id: '1', pointsBalance: 200 });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1')).rejects.toThrow(
        new HttpException('Customer not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should create a transaction and return the result', async () => {
      const business = { id: '1', pointsBalance: 200 };
      const customer = { id: '1', name: 'Test Customer', pointsBalance: 100 };
      const transaction = { id: '1', pointsAmount: 100, status: 'COMPLETED' };

      mockPrismaService.business.findUnique.mockResolvedValue(business);
      mockPrismaService.user.findUnique.mockResolvedValue(customer);
      mockTransactionRepository.create.mockResolvedValue(transaction);

      const result = await useCase.execute({ customerId: '1', purchaseAmount: 100 }, '1');

      expect(transactionRepository.create).toHaveBeenCalled();
      expect(result).toEqual({
        transactionId: transaction.id,
        status: transaction.status,
        pointsEarned: transaction.pointsAmount,
        customerName: customer.name,
        newCustomerBalance: customer.pointsBalance,
      });
    });
  });
});
