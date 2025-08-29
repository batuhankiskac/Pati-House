import { useState, useEffect, useCallback } from 'react';
import type { Cat } from '@/lib/data';

type CreateCatInput = {
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  dataAiHint?: string;
};

type UpdateCatInput = Partial<CreateCatInput>;

interface UseCatsResult {
  cats: Cat[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCat: (data: CreateCatInput) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
  updateCat: (id: number, data: UpdateCatInput) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
  deleteCat: (id: number) => Promise<{ success: boolean; error?: string }>;
}

const API_BASE = '/api/cats';

export function useCats(): UseCatsResult {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.debug('[hook][useCats] fetching list');
      const res = await fetch(API_BASE, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Liste alınamadı');
      }
      setCats(json.data);
      console.debug('[hook][useCats] fetched', json.data.length);
    } catch (e: any) {
      console.error('[hook][useCats] fetch error', e);
      setError(e.message || 'Hata');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  const createCat: UseCatsResult['createCat'] = useCallback(async (data) => {
    try {
      console.debug('[hook][useCats] createCat start');
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        return { success: false, error: json.error || 'Kedi eklenemedi' };
      }
      setCats(prev => [...prev, json.data]);
      console.debug('[hook][useCats] createCat ok id', json.data.id);
      return { success: true, cat: json.data };
    } catch (e: any) {
      console.error('[hook][useCats] createCat error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, []);

  const updateCat: UseCatsResult['updateCat'] = useCallback(async (id, data) => {
    try {
      console.debug('[hook][useCats] updateCat start', { id });
      // Optimistic snapshot
      const prev = cats;
      const idx = prev.findIndex(c => c.id === id);
      if (idx === -1) {
        return { success: false, error: 'Kedi bulunamadı (lokal)' };
      }
      const optimistic: Cat = { ...prev[idx], ...data };
      setCats(p => p.map(c => (c.id === id ? optimistic : c)));

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // rollback
        setCats(prev);
        return { success: false, error: json.error || 'Kedi güncellenemedi' };
      }
      // Ensure server version
      setCats(p => p.map(c => (c.id === id ? json.data : c)));
      console.debug('[hook][useCats] updateCat ok', { id });
      return { success: true, cat: json.data };
    } catch (e: any) {
      console.error('[hook][useCats] updateCat error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, [cats]);

  const deleteCat: UseCatsResult['deleteCat'] = useCallback(async (id) => {
    try {
      console.debug('[hook][useCats] deleteCat start', { id });
      const prev = cats;
      setCats(p => p.filter(c => c.id !== id));

      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // rollback
        setCats(prev);
        return { success: false, error: json.error || 'Kedi silinemedi' };
      }
      console.debug('[hook][useCats] deleteCat ok', { id });
      return { success: true };
    } catch (e: any) {
      console.error('[hook][useCats] deleteCat error', e);
      return { success: false, error: e.message || 'Beklenmeyen hata' };
    }
  }, [cats]);

  return {
    cats,
    loading,
    error,
    refresh: fetchCats,
    createCat,
    updateCat,
    deleteCat,
  };
}
