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
    const {
      customerId,
      purchaseAmount,
      businessId: dtoBusinessId,
    } = earnPointsDto;
    // Use businessId from parameter if provided, otherwise from DTO
    const finalBusinessId = businessId || dtoBusinessId;
    const pointsAmount = Math.floor(purchaseAmount); // 1:1 ratio

    // 1. Validate business and customer (repository will handle cache)
    const business = await this.prisma.business.findUnique({
      where: { id: finalBusinessId },
    });

    if (!business || business.pointsBalance < pointsAmount) {
      throw new HttpException(
        'Insufficient business points balance',
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
      .update(`${Date.now()}${finalBusinessId}${customerId}${pointsAmount}`)
      .digest('hex');

    // 3. Create transaction (repository handles cache updates)
    const transaction = await this.transactionRepository.create({
      type: TransactionType.EARN,
      pointsAmount,
      status: 'COMPLETED',
      auditHash,
      businessId: finalBusinessId,
      customerId,
    });

    // 4. Publish event
    this.eventPublisher.publishTransactionCompleted({ transaction });

    // 5. Fetch updated balances (repository already cached these)
    const updatedCustomer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!updatedCustomer) {
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

    return {
      transactionId: transaction.id,
      status: transaction.status,
      pointsEarned: transaction.pointsAmount,
      customerName: updatedCustomer.name,
      newCustomerBalance: updatedCustomer.pointsBalance,
    };
  }
}
