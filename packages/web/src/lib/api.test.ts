import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ApiService } from './api';

// Mock axios to prevent actual network requests
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(() => Promise.resolve({ data: 'mocked get' })),
    post: vi.fn(() => Promise.resolve({ data: 'mocked post' })),
    put: vi.fn(() => Promise.resolve({ data: 'mocked put' })),
    delete: vi.fn(() => Promise.resolve({ data: 'mocked delete' })),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
    defaults: {
      baseURL: '/api',
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(() => Promise.resolve({ data: 'mocked refresh' })), // For the refresh call
    },
    __esModule: true,
  };
});

describe('ApiService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Re-initialize the ApiService instance to clear any previous state
    // This is a bit tricky with singletons, but we can force it for testing
    // @ts-ignore
    ApiService.instance = undefined;
  });

  it('should be a singleton', () => {
    const instance1 = ApiService.getInstance();
    const instance2 = ApiService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create an axios instance with correct baseURL and withCredentials', () => {
    ApiService.getInstance();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      withCredentials: true,
    });
  });

  it('should attach a response interceptor', () => {
    ApiService.getInstance();
    // @ts-ignore
    expect(axios.create().interceptors.response.use).toHaveBeenCalledTimes(1);
  });

  // More tests for interceptor logic will go here
});
