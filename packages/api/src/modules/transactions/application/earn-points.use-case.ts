import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { EarnPointsDto } from './dto/earn-points.dto';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';
import * as crypto from 'crypto';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { TransactionEventPublisher } from './services/transaction-event.publisher';

@Injectable()
export class EarnPointsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly eventPublisher: TransactionEventPublisher,
  ) {}

  async execute(earnPointsDto: EarnPointsDto, businessId: string) {
    const {
      customerId,
      purchaseAmount,
      businessId: dtoBusinessId,
    } = earnPointsDto;
    // Use businessId from parameter if provided, otherwise from DTO
    const finalBusinessId = businessId || dtoBusinessId;
    const pointsAmount = Math.floor(purchaseAmount); // 1:1 ratio
    const businessBalanceKey = `business:${finalBusinessId}:balance`;
    const customerBalanceKey = `customer:${customerId}:balance`;

    // 1. Validate business and customer
    const cachedBusinessBalance =
      await this.redisService.get(businessBalanceKey);
    let business;

    if (cachedBusinessBalance) {
      business = {
        id: finalBusinessId,
        pointsBalance: parseInt(cachedBusinessBalance, 10),
      };
    } else {
      business = await this.prisma.business.findUnique({
        where: { id: finalBusinessId },
      });
      if (business) {
        await this.redisService.set(
          businessBalanceKey,
          business.pointsBalance.toString(),
        );
      }
    }

    if (!business || business.pointsBalance < pointsAmount) {
      throw new HttpException(
        'Insufficient business points balance',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cachedCustomerBalance =
      await this.redisService.get(customerBalanceKey);
    let customer;

    if (cachedCustomerBalance) {
      customer = {
        id: customerId,
        pointsBalance: parseInt(cachedCustomerBalance, 10),
      };
    } else {
      customer = await this.prisma.user.findUnique({
        where: { id: customerId },
      });
      if (customer) {
        await this.redisService.set(
          customerBalanceKey,
          customer.pointsBalance.toString(),
        );
      }
    }

    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    // 2. Generate audit hash
    const auditHash = crypto
      .createHash('sha256')
      .update(`${Date.now()}${finalBusinessId}${customerId}${pointsAmount}`)
      .digest('hex');

    // 3. Create transaction
    const transaction = await this.transactionRepository.create({
      type: TransactionType.EARN,
      pointsAmount,
      status: 'COMPLETED',
      auditHash,
      businessId: finalBusinessId,
      customerId,
    });

    const updatedCustomer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!updatedCustomer) {
      // This should not happen if the transaction succeeded, but it's a good practice to check
      throw new InternalServerErrorException(
        'Could not retrieve updated customer data.',
      );
    }

    const updatedBusiness = await this.prisma.business.findUnique({
      where: { id: finalBusinessId },
    });
    if (!updatedBusiness) {
      throw new InternalServerErrorException(
        'Could not retrieve updated business data.',
      );
    }

    await this.redisService.set(
      customerBalanceKey,
      updatedCustomer.pointsBalance.toString(),
    );
    await this.redisService.set(
      businessBalanceKey,
      updatedBusiness.pointsBalance.toString(),
    );

    return {
      transactionId: transaction.id,
      status: transaction.status,
      pointsEarned: transaction.pointsAmount,
      customerName: updatedCustomer.name,
      newCustomerBalance: updatedCustomer.pointsBalance,
    };
  }
}
