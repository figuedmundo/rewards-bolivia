import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EarnPointsDto {
  @ApiProperty({
    example: 'clx000000000000000000000',
    description: 'ID of the customer earning points',
  })
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @ApiProperty({
    example: 150,
    description: 'Amount of purchase for which points are earned',
  })
  @IsNumber()
  @IsNotEmpty()
  purchaseAmount!: number;
}

export class RedeemPointsDto {
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(20) // As per economic rules
  pointsToRedeem!: number;

  @IsNumber()
  @IsNotEmpty()
  ticketTotal!: number;
}

// Frontend-facing transaction response DTO
// Combines data from different endpoints
export interface TransactionDto {
  id: string;
  type: 'EARN' | 'REDEEM' | 'BURN' | 'EXPIRE' | 'ADJUSTMENT';
  amount: number;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  details?: {
    businessId?: string;
    customerId?: string;
    purchaseAmount?: number;
  };
}
