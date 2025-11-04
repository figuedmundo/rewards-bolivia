import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { AuthContext } from '../../contexts';
import api from '../../lib/api';

// Mock the api module
vi.mock('../../lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('renders children', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('skips refresh when no stored token', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      expect(mockedApi.post).not.toHaveBeenCalled();
    });
  });

  it('attempts refresh when token exists', async () => {
    localStorageMock.getItem.mockReturnValue('fake-token');
    mockedApi.post.mockResolvedValue({ data: { accessToken: 'new-token' } });

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken');
      expect(mockedApi.post).toHaveBeenCalledWith('/auth/refresh');
    });
  });

  it('handles successful refresh', async () => {
    localStorageMock.getItem.mockReturnValue('fake-token');
    mockedApi.post.mockResolvedValue({ data: { accessToken: 'new-token' } });

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'new-token');
      expect(mockedApi.defaults.headers.common.Authorization).toBe('Bearer new-token');
    });
  });

  it('handles failed refresh', async () => {
    localStorageMock.getItem.mockReturnValue('fake-token');
    mockedApi.post.mockRejectedValue(new Error('Refresh failed'));

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
    });
  });

  it('provides auth context to children', () => {
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      return <div>{auth ? 'Context provided' : 'No context'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Context provided')).toBeInTheDocument();
  });
});