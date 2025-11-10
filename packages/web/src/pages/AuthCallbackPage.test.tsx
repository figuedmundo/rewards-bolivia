import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import AuthCallbackPage from './AuthCallbackPage';
import { useAuth } from '../hooks';

// Mock the hooks
vi.mock('../hooks', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(() => ({ search: '' })), // Default mock for useLocation
  };
});

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseLocation = useLocation as jest.Mock;
const mockedUseNavigate = useNavigate as jest.Mock;

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading text initially', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    mockedUseLocation.mockReturnValue({
      search: '?accessToken=test-token',
    });

    mockedUseNavigate.mockReturnValue(vi.fn());

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('logs in and navigates to home when access token is present', async () => {
    const mockLogin = vi.fn();
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin,
      logout: vi.fn(),
    });

    mockedUseLocation.mockReturnValue({
      search: '?accessToken=test-token',
    });

    mockedUseNavigate.mockReturnValue(vi.fn());

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test-token');
    });
  });

  it('navigates to login when no access token is present', async () => {
    const navigateFn = vi.fn();
    mockedUseNavigate.mockReturnValue(navigateFn);

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    mockedUseLocation.mockReturnValue({
      search: '',
    });

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(navigateFn).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('handles URL parameters correctly', async () => {
    const mockLogin = vi.fn();
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: mockLogin,
      logout: vi.fn(),
    });

    mockedUseLocation.mockReturnValue({
      search: '?accessToken=my-test-token&other=param',
    });

    mockedUseNavigate.mockReturnValue(vi.fn());

    render(
      <MemoryRouter>
        <AuthCallbackPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('my-test-token');
    });
  });
});