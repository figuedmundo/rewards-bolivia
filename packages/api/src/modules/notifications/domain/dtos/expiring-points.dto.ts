import { IsString, IsInt, IsDate } from 'class-validator';

export class ExpiringPointsDto {
  @IsString()
  userId: string;

  @IsInt()
  pointsExpiring: number;

  @IsDate()
  expirationDate: Date;

  @IsInt()
  daysRemaining: number;
}
