import { createContext } from 'react';
import { User } from '@rewards-bolivia/shared-types';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null; // Use User type and allow null for unauthenticated state
  login: (accessToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);