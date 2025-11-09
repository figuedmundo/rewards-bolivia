import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';

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
