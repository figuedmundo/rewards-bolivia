import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import GoogleSignInButton from './GoogleSignInButton';

// Mock window.location
const mockLocation = {
  href: '',
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = '';
  });

  it('renders the Google sign-in button with correct text and image', () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();

    const image = screen.getByAltText('Google logo');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg');
  });

  it('redirects to Google OAuth endpoint when clicked', () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(button);

    expect(window.location.href).toBe('/api/auth/google');
  });

  it('has correct button styling', () => {
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', { name: /sign in with google/i });

    // Check that the button has the expected styles
    expect(button).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 15px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#fff',
      color: '#757575',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    });
  });

  it('has correct image styling', () => {
    render(<GoogleSignInButton />);

    const image = screen.getByAltText('Google logo');

    expect(image).toHaveStyle({
      width: '20px',
      height: '20px',
      marginRight: '10px',
    });
  });
});