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
  Configuration,
} from '@rewards-bolivia/sdk';
import type {
  UserDto,
} from '@rewards-bolivia/sdk';
// Import missing DTOs from shared-types (not in generated SDK)
import type {
  TransactionDto,
  LedgerEntryDto,
} from '@rewards-bolivia/shared-types';
import { ApiService } from './api';

// Lazy initialization of SDK clients
// This allows tests to properly mock the SDK before the clients are created
let cachedUsersApi: UsersApi | undefined;
let cachedTransactionsApi: TransactionsApi | undefined;
let cachedLedgerApi: LedgerApi | undefined;

const getUsersApi = (): UsersApi => {
  if (!cachedUsersApi) {
    const axiosInstance = ApiService.getInstance().api;
    const sdkConfig = new Configuration({
      basePath: '/api',
      baseOptions: {
        withCredentials: true,
      },
    });
    cachedUsersApi = new UsersApi(sdkConfig, '/api', axiosInstance);
  }
  return cachedUsersApi;
};

const getTransactionsApi = (): TransactionsApi => {
  if (!cachedTransactionsApi) {
    const axiosInstance = ApiService.getInstance().api;
    const sdkConfig = new Configuration({
      basePath: '/api',
      baseOptions: {
        withCredentials: true,
      },
    });
    cachedTransactionsApi = new TransactionsApi(sdkConfig, '/api', axiosInstance);
  }
  return cachedTransactionsApi;
};

const getLedgerApi = (): LedgerApi => {
  if (!cachedLedgerApi) {
    const axiosInstance = ApiService.getInstance().api;
    const sdkConfig = new Configuration({
      basePath: '/api',
      baseOptions: {
        withCredentials: true,
      },
    });
    cachedLedgerApi = new LedgerApi(sdkConfig, '/api', axiosInstance);
  }
  return cachedLedgerApi;
};

// Reset API clients (used for testing)
export const resetApiClients = (): void => {
  cachedUsersApi = undefined;
  cachedTransactionsApi = undefined;
  cachedLedgerApi = undefined;
};

// Types for API responses
export interface PaginatedLedgerResponse {
  entries: LedgerEntryDto[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Query parameters for ledger entries endpoint
 *
 * Extended to support filtering by transaction type, amount range, and search.
 * All parameters are optional to allow flexible filtering combinations.
 */
export interface LedgerQueryParams {
  /**
   * Account ID to filter by (typically user ID)
   */
  accountId?: string;

  /**
   * Specific transaction ID to filter by
   */
  transactionId?: string;

  /**
   * Date range start (ISO 8601 format: YYYY-MM-DD)
   */
  startDate?: string;

  /**
   * Date range end (ISO 8601 format: YYYY-MM-DD)
   */
  endDate?: string;

  /**
   * Comma-separated list of transaction types (EARN,REDEEM,ADJUSTMENT,BURN)
   * Multiple types use OR logic
   */
  type?: string;

  /**
   * Minimum transaction amount (inclusive)
   * Supports negative values for redemptions
   */
  minAmount?: number;

  /**
   * Maximum transaction amount (inclusive)
   * Supports negative values for redemptions
   */
  maxAmount?: number;

  /**
   * Search term for merchant/business name or transaction ID
   * Case-insensitive partial matching
   */
  search?: string;

  /**
   * Page number for pagination (1-indexed)
   */
  page?: number;

  /**
   * Number of items per page
   */
  pageSize?: number;
}

/**
 * Helper function to convert optional query parameters to SDK format
 * The SDK expects string parameters, but we use optional values
 * Empty strings are filtered out by the API
 */
const stringifyParam = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number') return value.toString();
  return value;
};

// Wallet API client wrapping SDK
export const walletApi = {
  // Get user balance (from user profile)
  // Uses auto-generated UsersApi.usersControllerFindOneById() method
  getBalance: async (userId: string): Promise<number> => {
    try {
      const response = await getUsersApi().usersControllerFindOneById(userId);
      const user = response.data;
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
      const response = await getUsersApi().usersControllerFindOneById(userId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Get paginated ledger entries with extended filter support
  // Uses auto-generated LedgerApi method
  getLedgerEntries: async (params: LedgerQueryParams): Promise<PaginatedLedgerResponse> => {
    try {
      const response = await getLedgerApi().ledgerControllerQueryEntries(
        stringifyParam(params.accountId),
        stringifyParam(params.transactionId),
        stringifyParam(params.startDate),
        stringifyParam(params.endDate),
        stringifyParam(params.type),
        stringifyParam(params.minAmount),
        stringifyParam(params.maxAmount),
        stringifyParam(params.search),
        stringifyParam(params.pageSize),
        stringifyParam(params.page)
      );
      return response.data as any; // API response type differs from SDK types
    } catch (error) {
      console.error('Failed to fetch ledger entries:', error);
      throw error;
    }
  },

  // Get single ledger entry
  // Uses auto-generated LedgerApi method
  getLedgerEntry: async (id: string): Promise<LedgerEntryDto> => {
    try {
      const response = await getLedgerApi().ledgerControllerGetEntry(id);
      return response.data as any;
    } catch (error) {
      console.error('Failed to fetch ledger entry:', error);
      throw error;
    }
  },

  // Verify ledger entry hash
  // Uses auto-generated LedgerApi method
  verifyLedgerEntry: async (id: string): Promise<{ valid: boolean; message: string }> => {
    try {
      const response = await getLedgerApi().ledgerControllerVerifyEntry(id);
      return response.data as any;
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
      const response = await getTransactionsApi().transactionsControllerRedeemPoints(payload as any);
      return response.data as any;
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
      const response = await getTransactionsApi().transactionsControllerEarnPoints(payload as any);
      return response.data as any;
    } catch (error) {
      console.error('Failed to earn points:', error);
      throw error;
    }
  },
};
