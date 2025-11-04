import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class EarnPointsDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @IsNotEmpty()
  purchaseAmount: number;
}
