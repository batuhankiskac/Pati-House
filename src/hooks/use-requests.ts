import { useState, useEffect, useCallback } from 'react';
import type { AdoptionRequest } from '@/lib/data';
import { fetchRequests, createRequest, updateStatus, deleteRequest, type CreateRequestInput } from '@/services/requests-service';
import type { AdoptionRequestFormData } from '@/lib/validation/requests';

interface UseRequestsResult {
  requests: AdoptionRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createRequest: (data: AdoptionRequestFormData) => Promise<{ success: boolean; request?: AdoptionRequest; error?: string }>;
  updateStatus: (id: number, status: 'Approved' | 'Rejected' | 'Pending') => Promise<{ success: boolean; request?: AdoptionRequest; error?: string }>;
  deleteRequest: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export function useRequests(): UseRequestsResult {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequestsCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRequests();
      if (result.success && result.data) {
        setRequests(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch requests');
      }
    } catch (e: any) {
      console.error('[hook][useRequests] fetch error', e);
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequestsCallback();
 }, [fetchRequestsCallback]);

  const createRequestCallback: UseRequestsResult['createRequest'] = useCallback(async (data: AdoptionRequestFormData) => {
    try {
      console.debug('[hook][useRequests] createRequest');
      const result = await createRequest(data);
      if (result.success && result.request) {
        setRequests(prev => [...prev, result.request as AdoptionRequest]);
        return { success: true, request: result.request };
      } else {
        return { success: false, error: result.error || 'Failed to create request' };
      }
    } catch (e: any) {
      console.error('[hook][useRequests] create error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, []);

  const updateStatusCallback: UseRequestsResult['updateStatus'] = useCallback(async (id, status) => {
    try {
      console.debug('[hook][useRequests] updateStatus', { id, status });
      // optimistic
      const prev = requests;
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return { success: false, error: 'Request not found (local)' };
      const optimistic = { ...prev[idx], status };
      setRequests(p => p.map(r => (r.id === id ? optimistic : r)));

      const result = await updateStatus(id, status);
      if (result.success && result.request) {
        setRequests(p => p.map(r => (r.id === id ? result.request as AdoptionRequest : r)));
        return { success: true, request: result.request };
      } else {
        setRequests(prev); // rollback
        return { success: false, error: result.error || 'Failed to update status' };
      }
    } catch (e: any) {
      console.error('[hook][useRequests] updateStatus error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, [requests]);

  const deleteRequestCallback: UseRequestsResult['deleteRequest'] = useCallback(async (id) => {
    try {
      console.debug('[hook][useRequests] delete', { id });
      const prev = requests;
      setRequests(p => p.filter(r => r.id !== id));

      const result = await deleteRequest(id);
      if (result.success) {
        return { success: true };
      } else {
        setRequests(prev); // rollback
        return { success: false, error: result.error || 'Failed to delete' };
      }
    } catch (e: any) {
      console.error('[hook][useRequests] delete error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, [requests]);

  return {
    requests,
    loading,
    error,
    refresh: async () => {
      // Invalidate cache and fetch fresh data
      // Note: In a real application, you might want to have a service method for this
      // For now, we'll just refetch
      await fetchRequestsCallback();
    },
    createRequest: createRequestCallback,
    updateStatus: updateStatusCallback,
    deleteRequest: deleteRequestCallback,
  };
}
