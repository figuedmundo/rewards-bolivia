import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EarnPointsUseCase } from '../../application/earn-points.use-case';
import { RedeemPointsUseCase } from '../../application/redeem-points.use-case';
import { EarnPointsDto } from '../../application/dto/earn-points.dto';
import { RedeemPointsDto } from '../../application/dto/redeem-points.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly earnPointsUseCase: EarnPointsUseCase,
    private readonly redeemPointsUseCase: RedeemPointsUseCase,
  ) {}

  @Post('earn')
  @UseGuards(AuthGuard('jwt')) // Assuming JWT authentication for businesses
  async earnPoints(@Body() earnPointsDto: EarnPointsDto, @Req() req) {
    // In a real scenario, the businessId would come from the authenticated user's token
    const businessId = req.user.id; // Use user ID as business ID for now
    return this.earnPointsUseCase.execute(earnPointsDto, businessId);
  }

  @Post('redeem')
  @UseGuards(AuthGuard('jwt')) // Assuming JWT authentication for customers
  async redeemPoints(@Body() redeemPointsDto: RedeemPointsDto, @Req() req) {
    const customerId = req.user.userId; // Assuming customer ID is in the 'userId' property of the JWT payload
    return this.redeemPointsUseCase.execute(redeemPointsDto, customerId);
  }
}
