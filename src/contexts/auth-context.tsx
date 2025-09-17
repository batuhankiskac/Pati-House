'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSafeRouter } from '@/hooks/use-safe-router';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useSafeRouter();

  // Check cookie on initial load
  useEffect(() => {
    const checkInitialAuth = async () => {
      if (typeof document === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/session', {
          credentials: 'include',
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(Boolean(data?.authenticated));
      } catch (error) {
        console.error('Failed to check session', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      setIsAuthenticated(true);
      router.push('/admin');
      return true;
    } catch (error) {
      console.error('Login request failed', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/session', {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed', error);
    } finally {
      setIsAuthenticated(false);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
