import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import type { RequestWithUser } from '@rewards-bolivia/shared-types';
import { EmissionRateAdjusterService } from '../../application/services/emission-rate-adjuster.service';

@Controller('admin/emission-rate-recommendations')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class EmissionRateController {
  constructor(
    private readonly emissionRateAdjusterService: EmissionRateAdjusterService,
  ) {}

  @Get()
  async listRecommendations(@Query('status') status?: string) {
    return this.emissionRateAdjusterService.getRecommendations(status);
  }

  @Get(':id')
  async getRecommendation(@Param('id') id: string) {
    const recommendations =
      await this.emissionRateAdjusterService.getRecommendations();
    const recommendation = recommendations.find((r) => r.id === id);

    if (!recommendation) {
      throw new NotFoundException(`Recommendation ${id} not found`);
    }

    return recommendation;
  }

  @Patch(':id/approve')
  async approveRecommendation(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    try {
      await this.emissionRateAdjusterService.applyRecommendation(
        id,
        req.user.userId,
      );

      return {
        message: 'Recommendation approved and applied successfully',
        recommendationId: id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }

  @Patch(':id/reject')
  async rejectRecommendation(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    try {
      await this.emissionRateAdjusterService.rejectRecommendation(
        id,
        req.user.userId,
      );

      return {
        message: 'Recommendation rejected successfully',
        recommendationId: id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }
}
