'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // İlk yüklemede cookie kontrolü
  useEffect(() => {
    const checkInitialAuth = () => {
      if (typeof document === 'undefined') return;

      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
      const hasValidToken = authCookie && authCookie.includes('authenticated');

      setIsAuthenticated(!!hasValidToken);
      setLoading(false);
    };

    checkInitialAuth();
  }, []);

  const login = async (password: string): Promise<boolean> => {
    if (password === 'admin') {
      // Cookie set et
      document.cookie = 'auth-token=authenticated; path=/; max-age=604800; SameSite=Lax';

      // State güncelle
      setIsAuthenticated(true);

      // Admin sayfasına git
      router.push('/admin');

      return true;
    }
    return false;
  };

  const logout = () => {
    // Cookie sil
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
