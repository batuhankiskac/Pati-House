'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cats as initialCats, type Cat } from '@/lib/data';

interface CatsContextType {
  cats: Cat[];
  refreshCats: () => void;
  isLoading: boolean;
}

const CatsContext = createContext<CatsContextType | undefined>(undefined);

export function CatsProvider({ children }: { children: ReactNode }) {
  const [cats, setCats] = useState<Cat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCats = async () => {
    setIsLoading(true);
    // Dinamik import ile fresh data al
    const { cats: freshCats } = await import('@/lib/data');
    setCats([...freshCats]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshCats();
    
    // Her 2 saniyede bir refresh
    const interval = setInterval(refreshCats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CatsContext.Provider value={{ cats, refreshCats, isLoading }}>
      {children}
    </CatsContext.Provider>
  );
}

export function useCats() {
  const context = useContext(CatsContext);
  if (context === undefined) {
    throw new Error('useCats must be used within a CatsProvider');
  }
  return context;
}
