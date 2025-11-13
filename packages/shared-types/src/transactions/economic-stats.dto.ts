import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class EconomicStatsDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalPointsIssued!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalPointsRedeemed!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  totalPointsBurned!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  burnRatio!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  activePointsPercentage!: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  redemptionRate!: number;
}
