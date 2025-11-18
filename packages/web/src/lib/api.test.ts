import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

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
    vi.resetModules();
  });

  it('should be a singleton', async () => {
    const { ApiService } = await import('./api');
    const instance1 = ApiService.getInstance();
    const instance2 = ApiService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should create an axios instance with correct baseURL and withCredentials', async () => {
    const { ApiService } = await import('./api');
    ApiService.getInstance();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      withCredentials: true,
    });
  });

  it('should attach a response interceptor', async () => {
    const { ApiService } = await import('./api');
    const service = ApiService.getInstance();
    // Interceptors are mocked and not directly exposed in AxiosInstance type
    expect(service.api.interceptors.response.use).toHaveBeenCalledTimes(1);
  });
});