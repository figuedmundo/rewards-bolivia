import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../../auth/get-user.decorator';
import type { User } from '@prisma/client';
import type { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { LedgerHashService } from '../../application/services/ledger-services/ledger-hash.service';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { LedgerEntryType } from '@prisma/client';

export interface LedgerQueryFilters {
  accountId?: string;
  transactionId?: string;
  startDate?: Date;
  endDate?: Date;
  types?: LedgerEntryType[];
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  limit: number;
  offset: number;
}

@Controller('ledger')
@UseGuards(AuthGuard('jwt'))
export class LedgerController {
  constructor(
    @Inject('ILedgerRepository')
    private readonly ledgerRepository: ILedgerRepository,
    private readonly ledgerHashService: LedgerHashService,
  ) {}

  /**
   * Query ledger entries with flexible filters
   * Supports: accountId, transactionId, date range, transaction type, amount range, and search
   */
  @Get('entries')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  async queryEntries(
    @GetUser() user: User,
    @Query('accountId') accountId?: string,
    @Query('transactionId') transactionId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('minAmount') minAmount?: string,
    @Query('maxAmount') maxAmount?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // Authorization: Users can only query their own accountId
    if (accountId && accountId !== user.id && user.role !== 'admin') {
      throw new UnauthorizedException(
        'You can only query your own ledger entries',
      );
    }

    const queryLimit = limit ? parseInt(limit, 10) : 50;
    const queryOffset = offset ? parseInt(offset, 10) : 0;

    if (queryLimit > 500) {
      throw new BadRequestException('Limit cannot exceed 500');
    }

    // Parse transaction types (comma-separated: EARN,REDEEM,ADJUSTMENT,BURN)
    let types: LedgerEntryType[] | undefined;
    if (type) {
      const typeArray = type.split(',').map((t) => t.trim().toUpperCase());
      const validTypes = ['EARN', 'REDEEM', 'ADJUSTMENT', 'BURN', 'EXPIRE'];

      for (const t of typeArray) {
        if (!validTypes.includes(t)) {
          throw new BadRequestException(
            `Invalid transaction type: ${t}. Valid types are: ${validTypes.join(', ')}`,
          );
        }
      }

      types = typeArray as LedgerEntryType[];
    }

    // Parse amount range
    const parsedMinAmount = minAmount ? parseFloat(minAmount) : undefined;
    const parsedMaxAmount = maxAmount ? parseFloat(maxAmount) : undefined;

    if (parsedMinAmount !== undefined && isNaN(parsedMinAmount)) {
      throw new BadRequestException('Invalid minAmount: must be a valid number');
    }

    if (parsedMaxAmount !== undefined && isNaN(parsedMaxAmount)) {
      throw new BadRequestException('Invalid maxAmount: must be a valid number');
    }

    if (
      parsedMinAmount !== undefined &&
      parsedMaxAmount !== undefined &&
      parsedMaxAmount < parsedMinAmount
    ) {
      throw new BadRequestException(
        'maxAmount must be greater than or equal to minAmount',
      );
    }

    // Parse date range
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate && endDate) {
      parsedStartDate = new Date(startDate);
      parsedEndDate = new Date(endDate);

      if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO 8601.');
      }

      if (parsedEndDate < parsedStartDate) {
        throw new BadRequestException(
          'endDate must be greater than or equal to startDate',
        );
      }
    }

    // Determine final accountId for query
    const finalAccountId =
      user.role === 'admin' && accountId ? accountId : user.id;

    // Build filters object
    const filters: LedgerQueryFilters = {
      accountId: finalAccountId,
      transactionId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      types,
      minAmount: parsedMinAmount,
      maxAmount: parsedMaxAmount,
      search: search?.trim(),
      limit: queryLimit,
      offset: queryOffset,
    };

    // Use unified query method with filters
    const result = await this.ledgerRepository.queryLedgerEntries(filters);

    return {
      ...result,
      limit: queryLimit,
      offset: queryOffset,
    };
  }

  /**
   * Get a single ledger entry by ID
   */
  @Get('entries/:id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  async getEntry(@GetUser() user: User, @Param('id') id: string) {
    const entry = await this.ledgerRepository.findLedgerEntryById(id);

    if (!entry) {
      throw new NotFoundException('Ledger entry not found');
    }

    // Authorization: Users can only access their own entries
    if (entry.accountId !== user.id && user.role !== 'admin') {
      throw new UnauthorizedException(
        'You can only access your own ledger entries',
      );
    }

    return entry;
  }

  /**
   * Verify integrity of a single ledger entry
   */
  @Get('entries/:id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  async verifyEntry(@GetUser() user: User, @Param('id') id: string) {
    const entry = await this.ledgerRepository.findLedgerEntryById(id);

    if (!entry) {
      throw new NotFoundException('Ledger entry not found');
    }

    // Authorization check
    if (entry.accountId !== user.id && user.role !== 'admin') {
      throw new UnauthorizedException(
        'You can only verify your own ledger entries',
      );
    }

    if (!entry.hash) {
      throw new BadRequestException(
        'Ledger entry does not have a hash (created before per-transaction hashing was implemented)',
      );
    }

    const valid = this.ledgerHashService.verifyEntryHash(entry);
    const computedHash = this.ledgerHashService.computeEntryHash(entry);

    return {
      id: entry.id,
      valid,
      storedHash: entry.hash,
      computedHash,
      entry,
      message: valid
        ? 'Hash verification passed - entry integrity confirmed'
        : 'Hash verification FAILED - entry may have been tampered with',
    };
  }
}
