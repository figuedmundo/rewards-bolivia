import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/components/providers/AuthProvider';

/**
 * Create a test-specific QueryClient with disabled retries
 * Speeds up tests by preventing automatic retry behavior
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Disable garbage collection for predictable test behavior
      },
      mutations: {
        retry: false,
      },
    },
  });

/**
 * Wrapper component providing all necessary providers for testing
 * Includes: QueryClientProvider, BrowserRouter, AuthProvider
 */
export const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that wraps component with all providers
 * Use this instead of RTL's render() in wallet tests
 *
 * @example
 * const { getByText } = render(<MyComponent />);
 */
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from RTL
export * from '@testing-library/react';
// Override render export
export { customRender as render };
