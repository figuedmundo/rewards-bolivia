/**
 * Wallet API Service Layer
 *
 * Wraps the auto-generated SDK clients from @rewards-bolivia/sdk
 * Provides wallet-specific methods for the rest of the application
 */

import {
  UsersApi,
  TransactionsApi,
  LedgerApi,
} from '@rewards-bolivia/sdk';
import type {
  UserDto,
} from '@rewards-bolivia/sdk';
// Import missing DTOs from shared-types (not in generated SDK)
import type {
  TransactionDto,
  LedgerEntryDto,
} from '@rewards-bolivia/shared-types';

// Initialize SDK clients with default configuration
const usersApi = new UsersApi();
const transactionsApi = new TransactionsApi();
const ledgerApi = new LedgerApi();

// Types for API responses
export interface PaginatedLedgerResponse {
  entries: LedgerEntryDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LedgerQueryParams {
  accountId?: string;
  transactionId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

// Wallet API client wrapping SDK
export const walletApi = {
  // Get user balance (from user profile)
  // Uses auto-generated UsersApi.usersControllerFindOneById() method
  getBalance: async (userId: string): Promise<number> => {
    try {
      const response = await usersApi.usersControllerFindOneById(userId);
      const user = response.data as UserDto;
      return user.pointsBalance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  },

  // Get user full profile
  // Uses auto-generated UsersApi.usersControllerFindOneById() method
  getUser: async (userId: string): Promise<UserDto> => {
    try {
      const response = await usersApi.usersControllerFindOneById(userId);
      return response.data as UserDto;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Get paginated ledger entries
  // Uses auto-generated LedgerApi method
  getLedgerEntries: async (params: LedgerQueryParams): Promise<PaginatedLedgerResponse> => {
    try {
      const response = await ledgerApi.ledgerControllerQueryEntries(
        params.accountId || '',
        params.transactionId || '',
        params.startDate || '',
        params.endDate || '',
        String(params.pageSize || 10),
        String((params.page || 1) - 1) // offset is 0-based
      );
      return (response.data as unknown) as PaginatedLedgerResponse;
    } catch (error) {
      console.error('Failed to fetch ledger entries:', error);
      throw error;
    }
  },

  // Get single ledger entry
  // Uses auto-generated LedgerApi method
  getLedgerEntry: async (id: string): Promise<LedgerEntryDto> => {
    try {
      const response = await ledgerApi.ledgerControllerGetEntry(id);
      return (response.data as unknown) as LedgerEntryDto;
    } catch (error) {
      console.error('Failed to fetch ledger entry:', error);
      throw error;
    }
  },

  // Verify ledger entry hash
  // Uses auto-generated LedgerApi method
  verifyLedgerEntry: async (id: string): Promise<{ valid: boolean; message: string }> => {
    try {
      const response = await ledgerApi.ledgerControllerVerifyEntry(id);
      return (response.data as unknown) as { valid: boolean; message: string };
    } catch (error) {
      console.error('Failed to verify ledger entry:', error);
      throw error;
    }
  },

  // Redeem points
  // Uses auto-generated TransactionsApi method
  redeemPoints: async (payload: {
    points: number;
    businessId: string;
    purchaseAmount: number;
  }): Promise<TransactionDto> => {
    try {
      const response = await transactionsApi.transactionsControllerRedeemPoints(payload);
      return (response.data as unknown) as TransactionDto;
    } catch (error) {
      console.error('Failed to redeem points:', error);
      throw error;
    }
  },

  // Earn points (for business flow - optional for Epic 7)
  // Uses auto-generated TransactionsApi method
  earnPoints: async (payload: {
    customerId: string;
    purchaseAmount: number;
  }): Promise<TransactionDto> => {
    try {
      const response = await transactionsApi.transactionsControllerEarnPoints(payload);
      return (response.data as unknown) as TransactionDto;
    } catch (error) {
      console.error('Failed to earn points:', error);
      throw error;
    }
  },
};
