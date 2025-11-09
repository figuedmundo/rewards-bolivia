import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EarnPointsDto {
  @ApiProperty({
    example: 'clx000000000000000000000',
    description: 'ID of the customer earning points',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 150,
    description: 'Amount of purchase for which points are earned',
  })
  @IsNumber()
  @IsNotEmpty()
  purchaseAmount: number;
}
