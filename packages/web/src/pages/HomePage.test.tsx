import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HomePage from './HomePage';
import { useAuth } from '../hooks';

// Mock the useAuth hook
vi.mock('../hooks', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the welcome message', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByRole('heading', { name: /welcome to the home page/i })).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: mockLogout,
    });

    render(<HomePage />);

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('calls useAuth hook', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<HomePage />);

    expect(mockedUseAuth).toHaveBeenCalledTimes(1);
  });
});