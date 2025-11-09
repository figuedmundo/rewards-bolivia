import {
  Injectable,
  Inject,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EarnPointsDto } from '@rewards-bolivia/shared-types';
import { type ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';
import * as crypto from 'crypto';
import { TransactionEventPublisher } from './services/transaction-event.publisher';

@Injectable()
export class EarnPointsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly prisma: PrismaService,
    private readonly eventPublisher: TransactionEventPublisher,
  ) {}

  async execute(earnPointsDto: EarnPointsDto, businessId: string) {
    const { customerId, purchaseAmount } = earnPointsDto;
    const pointsAmount = Math.floor(purchaseAmount); // 1:1 ratio

    // 1. Validate business and customer
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.pointsBalance < pointsAmount) {
      throw new HttpException(
        'Business not found or insufficient points balance',
        HttpStatus.BAD_REQUEST,
      );
    }

    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    // 2. Generate audit hash
    const auditHash = crypto
      .createHash('sha256')
      .update(`${Date.now()}${businessId}${customerId}${pointsAmount}`)
      .digest('hex');

    // 3. Create transaction (repository handles all balance updates)
    const transaction = await this.transactionRepository.create({
      type: TransactionType.EARN,
      pointsAmount,
      status: 'COMPLETED',
      auditHash,
      businessId: businessId,
      customerId,
    });

    // 4. Publish event
    this.eventPublisher.publishTransactionCompleted({ transaction });

    // 5. Fetch updated balances
    const updatedCustomer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!updatedCustomer) {
      throw new InternalServerErrorException(
        'Could not retrieve updated customer data.',
      );
    }

    return {
      transactionId: transaction.id,
      status: transaction.status,
      pointsEarned: transaction.pointsAmount,
      newCustomerBalance: updatedCustomer.pointsBalance,
      businessName: business.name,
    };
  }
}
