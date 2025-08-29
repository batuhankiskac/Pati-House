import { useState, useEffect, useCallback } from 'react';
import type { AdoptionRequest } from '@/lib/data';

const API_BASE = '/api/requests';

interface UseRequestsResult {
  requests: AdoptionRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createRequest: (data: {
    catName: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    reason: string;
  }) => Promise<{ success: boolean; request?: AdoptionRequest; error?: string }>;
  updateStatus: (id: number, status: 'Onaylandı' | 'Reddedildi' | 'Bekliyor') => Promise<{ success: boolean; request?: AdoptionRequest; error?: string }>;
  deleteRequest: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export function useRequests(): UseRequestsResult {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.debug('[hook][useRequests] fetching list');
      const res = await fetch(API_BASE, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Başvurular alınamadı');
      }
      setRequests(json.data);
      console.debug('[hook][useRequests] fetched', json.data.length);
    } catch (e: any) {
      console.error('[hook][useRequests] fetch error', e);
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest: UseRequestsResult['createRequest'] = useCallback(async (data) => {
    try {
      console.debug('[hook][useRequests] createRequest');
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Başvuru oluşturulamadı' };
      }
      setRequests(prev => [...prev, json.data]);
      return { success: true, request: json.data };
    } catch (e: any) {
      console.error('[hook][useRequests] create error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, []);

  const updateStatus: UseRequestsResult['updateStatus'] = useCallback(async (id, status) => {
    try {
      console.debug('[hook][useRequests] updateStatus', { id, status });
      // optimistic
      const prev = requests;
      const idx = prev.findIndex(r => r.id === id);
      if (idx === -1) return { success: false, error: 'Başvuru bulunamadı (lokal)' };
      const optimistic = { ...prev[idx], status };
      setRequests(p => p.map(r => (r.id === id ? optimistic : r)));

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setRequests(prev); // rollback
        return { success: false, error: json.error || 'Durum güncellenemedi' };
      }
      setRequests(p => p.map(r => (r.id === id ? json.data : r)));
      return { success: true, request: json.data };
    } catch (e: any) {
      console.error('[hook][useRequests] updateStatus error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, [requests]);

  const deleteRequest: UseRequestsResult['deleteRequest'] = useCallback(async (id) => {
    try {
      console.debug('[hook][useRequests] delete', { id });
      const prev = requests;
      setRequests(p => p.filter(r => r.id !== id));
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setRequests(prev); // rollback
        return { success: false, error: json.error || 'Silinemedi' };
      }
      return { success: true };
    } catch (e: any) {
      console.error('[hook][useRequests] delete error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, [requests]);

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    createRequest,
    updateStatus,
    deleteRequest,
  };
}
