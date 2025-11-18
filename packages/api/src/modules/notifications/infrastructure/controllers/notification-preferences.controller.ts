import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { PrismaService } from '../../../../infrastructure/prisma.service';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { RequestWithUser } from '@rewards-bolivia/shared-types';
import { Request } from '@nestjs/common';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@Controller('users/me/preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        emailNotifications: {
          type: 'boolean',
          description: 'Whether user receives email notifications about expiring points',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPreferences(@Request() req: RequestWithUser) {
    const userId = req.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailNotifications: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      emailNotifications: user.emailNotifications,
    };
  }

  @Patch()
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences updated successfully',
    schema: {
      type: 'object',
      properties: {
        emailNotifications: {
          type: 'boolean',
          description: 'Updated notification preference',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user.userId;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { emailNotifications: dto.emailNotifications },
      select: { emailNotifications: true },
    });

    return {
      emailNotifications: user.emailNotifications,
    };
  }
}
