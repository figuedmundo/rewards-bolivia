import { Injectable, Inject, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { EarnPointsDto } from './dto/earn-points.dto';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class EarnPointsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(earnPointsDto: EarnPointsDto, businessId: string) {
    const { customerId, purchaseAmount } = earnPointsDto;
    const pointsAmount = Math.floor(purchaseAmount); // 1:1 ratio

    // 1. Validate business and customer
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business || business.pointsBalance < pointsAmount) {
      throw new HttpException('Insufficient business points balance', HttpStatus.BAD_REQUEST);
    }

    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    // 2. Generate audit hash
    const auditHash = crypto
      .createHash('sha256')
      .update(`${Date.now()}${businessId}${customerId}${pointsAmount}`)
      .digest('hex');

    // 3. Create transaction
    const transaction = await this.transactionRepository.create({
      type: TransactionType.EARN,
      pointsAmount,
      status: 'COMPLETED',
      auditHash,
      businessId,
      customerId,
    });

    const updatedCustomer = await this.prisma.user.findUnique({ where: { id: customerId } });

    if (!updatedCustomer) {
      // This should not happen if the transaction succeeded, but it's a good practice to check
      throw new InternalServerErrorException('Could not retrieve updated customer data.');
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
