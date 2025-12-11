import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import HomePage from './HomePage';
import { useAuth } from '../hooks';
import { BrowserRouter } from 'react-router-dom';

// Mock the useAuth hook
vi.mock('../hooks', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedUseAuth = useAuth as ReturnType<typeof vi.fn>;

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  );
};

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

    renderHomePage();

    expect(screen.getByRole('heading', { name: /welcome to the home page/i })).toBeInTheDocument();
  });

  it('renders the wallet and logout buttons', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderHomePage();

    expect(screen.getByRole('button', { name: /go to wallet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('navigates to wallet when wallet button is clicked', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com', role: 'client' },
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderHomePage();

    const walletButton = screen.getByRole('button', { name: /go to wallet/i });
    fireEvent.click(walletButton);

    expect(mockNavigate).toHaveBeenCalledWith('/wallet');
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

    renderHomePage();

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

    renderHomePage();

    expect(mockedUseAuth).toHaveBeenCalledTimes(1);
  });
});