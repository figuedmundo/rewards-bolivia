import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { resetApiClients } from '../lib/wallet-api';

// Mock localStorage to prevent "localStorage.getItem is not a function" errors
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  resetApiClients();
});

// Global mocks for SDK and API Service
// These are needed because wallet-api.ts initializes SDK clients at module load time

// Mock the SDK with proper constructor functions that work with 'new'
vi.mock('@rewards-bolivia/sdk', () => {
  const createMockUsersApi = vi.fn().mockImplementation(() => ({
    usersControllerFindOneById: vi.fn(),
    usersControllerGetProfile: vi.fn(),
  }));

  const createMockTransactionsApi = vi.fn().mockImplementation(() => ({
    transactionsControllerRedeemPoints: vi.fn(),
    transactionsControllerEarnPoints: vi.fn(),
  }));

  const createMockLedgerApi = vi.fn().mockImplementation(() => ({
    ledgerControllerQueryEntries: vi.fn(),
    ledgerControllerGetEntry: vi.fn(),
    ledgerControllerVerifyEntry: vi.fn(),
  }));

  return {
    UsersApi: createMockUsersApi,
    TransactionsApi: createMockTransactionsApi,
    LedgerApi: createMockLedgerApi,
    Configuration: vi.fn().mockImplementation(() => ({})),
  };
});

// Mock the ApiService
vi.mock('../lib/api', () => ({
  ApiService: {
    getInstance: vi.fn(() => ({
      api: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        defaults: { baseURL: '/api' },
        interceptors: { response: { use: vi.fn() } },
      },
    })),
  },
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
