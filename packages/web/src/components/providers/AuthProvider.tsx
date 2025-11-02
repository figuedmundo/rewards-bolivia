import { useState, ReactNode, useEffect } from 'react';
import { AuthContext } from '../../contexts';
import api from '../../lib/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Only attempt refresh if there's an access token in localStorage,
      // indicating a potential previous session
      const hasStoredToken = localStorage.getItem('accessToken');

      if (!hasStoredToken) {
        console.log('AuthProvider: No stored token found, skipping refresh');
        setIsLoading(false);
        return;
      }

      console.log('AuthProvider: Attempting to verify auth session...');
      try {
        const { data } = await api.post('/auth/refresh');
        console.log('AuthProvider: Session refresh successful', data);
        if (data.accessToken) {
          login(data.accessToken);
        }
      } catch (error) {
        console.error('AuthProvider: Session refresh failed.', error);
        // Clear any stale token
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    }
    localStorage.removeItem('accessToken');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
