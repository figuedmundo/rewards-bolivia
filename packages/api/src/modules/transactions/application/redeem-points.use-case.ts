import { Injectable, Inject, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { TransactionType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class RedeemPointsUseCase {
  constructor(
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(redeemPointsDto: RedeemPointsDto, customerId: string) {
    const { businessId, pointsToRedeem, ticketTotal } = redeemPointsDto;

    // 1. Validate customer and business
    const customer = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new HttpException('Customer not found', HttpStatus.NOT_FOUND);
    }

    if (customer.pointsBalance < pointsToRedeem) {
      throw new HttpException('Insufficient points balance', HttpStatus.BAD_REQUEST);
    }

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      throw new HttpException('Business not found', HttpStatus.NOT_FOUND);
    }

    // 2. Validate redemption limit (30% of ticket total)
    const redemptionValue = pointsToRedeem * 0.03; // 1 point = 0.03 Bs
    if (redemptionValue > ticketTotal * 0.3) {
      throw new HttpException('Redemption value exceeds 30% of ticket total', HttpStatus.BAD_REQUEST);
    }

    // 3. Generate audit hash
    const auditHash = crypto
      .createHash('sha256')
      .update(`${Date.now()}${businessId}${customerId}${pointsToRedeem}`)
      .digest('hex');

    // 4. Create transaction
    const transaction = await this.transactionRepository.redeem({
      type: TransactionType.REDEEM,
      pointsAmount: pointsToRedeem,
      status: 'COMPLETED',
      auditHash,
      businessId,
      customerId,
    });

    const updatedCustomer = await this.prisma.user.findUnique({ where: { id: customerId } });
    if (!updatedCustomer) {
      throw new InternalServerErrorException('Could not retrieve updated customer data.');
    }

    return {
      transactionId: transaction.id,
      status: transaction.status,
      pointsRedeemed: transaction.pointsAmount,
      discountValueBs: (transaction.pointsAmount * 0.03).toFixed(2),
      newCustomerBalance: updatedCustomer.pointsBalance,
      businessName: business.name,
    };
  }
}
