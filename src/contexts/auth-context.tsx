'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession, getSession, destroySession } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check cookie on initial load
  useEffect(() => {
    const checkInitialAuth = async () => {
      if (typeof document === 'undefined') {
        setLoading(false);
        return;
      }

      // Use the getSession function to check authentication
      const session = await getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };

    checkInitialAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const success = await createSession(username, password);

    if (success) {
      // Update state
      setIsAuthenticated(true);

      // Go to admin page
      router.push('/admin');

      return true;
    }
    return false;
  };

  const logout = async () => {
    // Use the destroySession function to clear the cookie
    await destroySession();
    setIsAuthenticated(false);
    router.push('/');
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
