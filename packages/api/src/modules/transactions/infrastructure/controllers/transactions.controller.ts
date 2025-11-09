import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  NotFoundException,
  Get,
} from '@nestjs/common';
import { EarnPointsUseCase } from '../../application/earn-points.use-case';
import { RedeemPointsUseCase } from '../../application/redeem-points.use-case';
import {
  EarnPointsDto,
  RedeemPointsDto,
  RequestWithUser,
} from '@rewards-bolivia/shared-types';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { EconomicControlService } from '../../application/services/economic-control.service';
import { RolesGuard } from 'src/modules/auth/roles.guard';
import { Roles } from 'src/modules/auth/roles.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly earnPointsUseCase: EarnPointsUseCase,
    private readonly redeemPointsUseCase: RedeemPointsUseCase,
    private readonly prisma: PrismaService, // Injected PrismaService
    private readonly economicControlService: EconomicControlService,
  ) {}

  @Post('earn')
  @UseGuards(AuthGuard('jwt'))
  @Roles('business') // Only business role can earn points
  async earnPoints(
    @Body() earnPointsDto: EarnPointsDto,
    @Req() req: RequestWithUser,
  ) {
    const businessOwnerId = req.user.userId;

    // Find the business associated with the authenticated owner
    const business = await this.prisma.business.findFirst({
      where: { ownerId: businessOwnerId },
    });

    if (!business) {
      throw new NotFoundException(
        `No business found for owner ID: ${businessOwnerId}`,
      );
    }

    // Now, use the correct business ID for the use case
    return this.earnPointsUseCase.execute(earnPointsDto, business.id);
  }

  @Post('redeem')
  @UseGuards(AuthGuard('jwt')) // Assuming JWT authentication for customers
  @Roles('customer') // Only customer role can redeem points
  async redeemPoints(
    @Body() redeemPointsDto: RedeemPointsDto,
    @Req() req: RequestWithUser,
  ) {
    const customerId = req.user.userId; // Correctly access customer ID from JWT payload
    return this.redeemPointsUseCase.execute(redeemPointsDto, customerId);
  }

  @Get('economy-stats')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async getEconomyStats() {
    return this.economicControlService.getEconomyStats();
  }
}
