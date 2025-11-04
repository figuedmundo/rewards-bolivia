import { render, screen } from '@testing-library/react';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Welcome to your dashboard!')).toBeInTheDocument();
  });

  it('has correct container styling', () => {
    render(<DashboardPage />);

    const container = screen.getByRole('heading', { name: /dashboard/i }).parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    });
  });
});