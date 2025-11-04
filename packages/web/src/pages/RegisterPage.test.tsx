import { render, screen } from '@testing-library/react';
import RegisterPage from './RegisterPage';

describe('RegisterPage', () => {
  it('renders the register heading', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('renders the register button', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('renders the Google Sign-In button', () => {
    render(<RegisterPage />);

    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('has correct input field types', () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText('Name')).toHaveAttribute('type', 'text');
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
  });

  it('has correct styling for the container', () => {
    render(<RegisterPage />);

    const container = screen.getByRole('heading', { name: /register/i }).parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    });
  });

  it('has correct styling for input fields', () => {
    render(<RegisterPage />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toHaveStyle({
        padding: '10px',
        width: '300px',
        marginBottom: '10px',
      });
    });
  });

  it('has correct styling for register button', () => {
    render(<RegisterPage />);

    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toHaveStyle({
      padding: '10px 20px',
      width: '320px',
      marginBottom: '10px',
    });
  });
});