import { useState, useEffect, useCallback } from 'react';
import { adoptionRequests as initialRequests, type AdoptionRequest } from '@/lib/data';
import { dataEmitter } from '@/lib/events';

export function useRequests() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshRequests = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    dataEmitter.emit('requests-updated');
  }, []);

  useEffect(() => {
    const handleRequestsUpdate = () => {
      setRefreshKey(prev => prev + 1);
    };

    dataEmitter.on('requests-updated', handleRequestsUpdate);

    return () => {
      dataEmitter.off('requests-updated', handleRequestsUpdate);
    };
  }, []);

  // Always return current requests from data file
  const requests = initialRequests;

  return {
    requests,
    refreshRequests,
    refreshKey, // For forcing re-renders
  };
}
