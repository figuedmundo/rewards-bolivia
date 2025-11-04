import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from './useAuth';
import { AuthProvider } from '../components/providers/AuthProvider';
import { ReactNode } from 'react';

describe('useAuth', () => {
  it('should return auth context when used within AuthProvider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should throw an error when used outside of AuthProvider', () => {
    // Suppress console.error for this test because React will log the error
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );

    // Restore console.error
    console.error = originalError;
  });
});
