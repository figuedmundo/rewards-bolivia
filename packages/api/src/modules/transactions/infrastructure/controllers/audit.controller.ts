import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { AuditHashService } from '../../application/services/audit-hash.service';

@Controller('admin/audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AuditController {
  constructor(private readonly auditHashService: AuditHashService) {}

  /**
   * Get audit hash for a specific date
   * @param dateStr - Date in YYYY-MM-DD format
   */
  @Get('hash/:date')
  async getHashForDate(@Param('date') dateStr: string) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Use YYYY-MM-DD format.',
        );
      }

      const hash = await this.auditHashService.getDailyHash(date);

      if (!hash) {
        throw new NotFoundException(`No audit hash found for date: ${dateStr}`);
      }

      return hash;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Verify audit hash for a specific date (recompute and compare)
   * @param dateStr - Date in YYYY-MM-DD format
   */
  @Get('verify/:date')
  async verifyHash(@Param('date') dateStr: string) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Use YYYY-MM-DD format.',
        );
      }

      const verification = await this.auditHashService.verifyDailyHash(date);

      return {
        ...verification,
        message: verification.valid
          ? 'Hash verification passed - data integrity confirmed'
          : 'Hash verification FAILED - data may have been tampered with',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Manually generate audit hash for a specific date
   * @param dateStr - Date in YYYY-MM-DD format
   */
  @Post('generate/:date')
  async generateHash(@Param('date') dateStr: string) {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Use YYYY-MM-DD format.',
        );
      }

      const hash = await this.auditHashService.generateDailyHash(date);

      return {
        message: 'Audit hash generated successfully',
        hash,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Get all daily audit hashes (with optional limit)
   */
  @Get('hashes')
  async getAllHashes(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 30;

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 365) {
      throw new BadRequestException(
        'Invalid limit. Must be between 1 and 365.',
      );
    }

    return this.auditHashService.getAllDailyHashes(limitNum);
  }
}
