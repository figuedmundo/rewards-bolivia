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
import { ILedgerRepository } from '../../domain/repositories/ledger.repository';
import { LedgerHashService } from '../../application/services/ledger-services/ledger-hash.service';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';

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

    // Query by transaction (highest priority)
    if (transactionId) {
      const entries =
        await this.ledgerRepository.findLedgerEntriesByTransaction(
          transactionId,
        );

      return {
        entries,
        total: entries.length,
        limit: queryLimit,
        offset: queryOffset,
      };
    }

    // Query by account
    const finalAccountId =
      user.role === 'admin' && accountId ? accountId : user.id;

    // Query by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO 8601.');
      }

      const result = await this.ledgerRepository.findLedgerEntriesByDateRange(
        start,
        end,
        { limit: queryLimit, offset: queryOffset },
      );

      return {
        ...result,
        limit: queryLimit,
        offset: queryOffset,
      };
    }

    // No filters - query user's own entries (default)
    const result = await this.ledgerRepository.findLedgerEntriesByAccount(
      finalAccountId,
      { limit: queryLimit, offset: queryOffset },
    );

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
