import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../../src/App';
import api from '../../src/lib/api';
import { AuthProvider } from '../../src/components/providers/AuthProvider';

// Mock the api module
vi.mock('../../src/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow a user to log in and be redirected to the home page', async () => {
    mockedApi.post.mockResolvedValue({ data: { accessToken: 'fake-jwt-token' } });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // User is on the login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // User fills out the form
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    // User clicks the login button
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the redirect and the home page to render
    await waitFor(() => {
      // Assert that the user is on the home page
      expect(screen.getByRole('heading', { name: /welcome to the home page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    // Assert that the API was called correctly
    expect(mockedApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should show an error message on failed login', async () => {
    mockedApi.post.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // Wait for the login page to load (since AuthProvider might be loading)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    });

    // User fills out the form with wrong credentials
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to login/i)).toBeInTheDocument();
    });
  });
});
