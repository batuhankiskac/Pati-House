import { useState, useEffect, useCallback } from 'react';
import type { Cat } from '@/lib/data';
import { fetchCats, createCat, updateCat, deleteCat, type CreateCatInput, type UpdateCatInput } from '@/services/cats-service';
import type { CatFormData, CatUpdateData } from '@/lib/validation/cats';

interface UseCatsResult {
  cats: Cat[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCat: (data: CatFormData) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
  updateCat: (id: number, data: CatUpdateData) => Promise<{ success: boolean; cat?: Cat; error?: string }>;
  deleteCat: (id: number) => Promise<{ success: boolean; error?: string }>;
}

export function useCats(): UseCatsResult {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatsCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCats();
      if (result.success && result.data) {
        setCats(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch cats');
      }
    } catch (e: any) {
      console.error('[hook][useCats] fetch error', e);
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatsCallback();
  }, [fetchCatsCallback]);

  const createCatCallback: UseCatsResult['createCat'] = useCallback(async (data: CatFormData) => {
    try {
      console.debug('[hook][useCats] createCat start');
      const result = await createCat(data);
      if (result.success && result.cat) {
        setCats(prev => [...prev, result.cat as Cat]);
        console.debug('[hook][useCats] createCat ok id', (result.cat as Cat).id);
        return { success: true, cat: result.cat };
      } else {
        return { success: false, error: result.error || 'Failed to add cat' };
      }
    } catch (e: any) {
      console.error('[hook][useCats] createCat error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, []);

  const updateCatCallback: UseCatsResult['updateCat'] = useCallback(async (id: number, data: CatUpdateData) => {
    try {
      console.debug('[hook][useCats] updateCat start', { id });
      // Optimistic snapshot
      const prev = cats;
      const idx = prev.findIndex(c => c.id === id);
      if (idx === -1) {
        return { success: false, error: 'Cat not found (local)' };
      }
      const optimistic: Cat = { ...prev[idx], ...data };
      setCats(p => p.map(c => (c.id === id ? optimistic : c)));

      const result = await updateCat(id, data);
      if (result.success && result.cat) {
        // Ensure server version
        setCats(p => p.map(c => (c.id === id ? result.cat as Cat : c)));
        console.debug('[hook][useCats] updateCat ok', { id });
        return { success: true, cat: result.cat };
      } else {
        // rollback
        setCats(prev);
        return { success: false, error: result.error || 'Failed to update cat' };
      }
    } catch (e: any) {
      console.error('[hook][useCats] updateCat error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, [cats]);

  const deleteCatCallback: UseCatsResult['deleteCat'] = useCallback(async (id) => {
    try {
      console.debug('[hook][useCats] deleteCat start', { id });
      const prev = cats;
      setCats(p => p.filter(c => c.id !== id));

      const result = await deleteCat(id);
      if (result.success) {
        console.debug('[hook][useCats] deleteCat ok', { id });
        return { success: true };
      } else {
        // rollback
        setCats(prev);
        return { success: false, error: result.error || 'Failed to delete cat' };
      }
    } catch (e: any) {
      console.error('[hook][useCats] deleteCat error', e);
      return { success: false, error: e.message || 'Unexpected error' };
    }
  }, [cats]);

  return {
    cats,
    loading,
    error,
    refresh: async () => {
      // Invalidate cache and fetch fresh data
      // Note: In a real application, you might want to have a service method for this
      // For now, we'll just refetch
      await fetchCatsCallback();
    },
    createCat: createCatCallback,
    updateCat: updateCatCallback,
    deleteCat: deleteCatCallback,
  };
}
