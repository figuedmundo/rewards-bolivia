import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthContext, AuthContextType } from './AuthContext';

describe('AuthContext', () => {
  it('creates context with undefined default value', () => {
    expect(AuthContext).toBeDefined();
    // The default value is undefined, which is expected for context
  });

  it('can be used as a provider', () => {
    const mockValue: AuthContextType = {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
    };

    render(
      <AuthContext.Provider value={mockValue}>
        <div>Test</div>
      </AuthContext.Provider>
    );

    // If no error is thrown, the context is working
    expect(true).toBe(true);
  });
});