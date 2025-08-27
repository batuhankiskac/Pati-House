import { useState, useEffect, useCallback } from 'react';
import { cats as initialCats, type Cat } from '@/lib/data';
import { dataEmitter } from '@/lib/events';

export function useCats() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshCats = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    dataEmitter.emit('cats-updated');
  }, []);

  useEffect(() => {
    const handleCatsUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    dataEmitter.on('cats-updated', handleCatsUpdate);

    return () => {
      dataEmitter.off('cats-updated', handleCatsUpdate);
    };
  }, []);

  // Always return current cats from data file
  const cats = initialCats;

  return {
    cats,
    refreshCats,
    refreshKey, // For forcing re-renders
  };
}
