// Service for cat-related API calls and business logic
import type { Cat } from '@/lib/data';
import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';
import { validateData } from '@/lib/validation/utils';
import type { CatFormData, CatUpdateData } from '@/lib/validation/cats';
import { API_ENDPOINTS } from '@/lib/config';
import logger from '@/lib/logger';


type CreateCatInput = CatFormData;
type UpdateCatInput = CatUpdateData;
// const API_BASE = '/api/cats';
const API_BASE = API_ENDPOINTS.CATS;

type CacheUtilsModule = typeof import('@/lib/cache/cache-utils');

let cacheUtilsPromise: Promise<CacheUtilsModule['default']> | null = null;

async function getCacheUtils(): Promise<CacheUtilsModule['default'] | null> {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    return null;
  }

  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') {
    return null;
  }

  if (!cacheUtilsPromise) {
    cacheUtilsPromise = import('@/lib/cache/cache-utils').then((mod) => mod.default);
  }

  return cacheUtilsPromise;
}

async function fetchCats(): Promise<{ success: boolean; data?: Cat[]; error?: string }> {
  const startTime = Date.now();
  try {
    const cache = await getCacheUtils();
    // Try to get from cache first
    const cachedCats = cache ? await cache.getCachedCats() : null;
    if (cachedCats && cachedCats.length > 0) {
      const duration = Date.now() - startTime;
      logger.debug('[service][cats] returning cached list', { duration, count: cachedCats.length });
      return { success: true, data: cachedCats };
    }

    logger.debug('[service][cats] fetching list');
    const res = await fetch(API_BASE, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch list');
    }

    // Cache the result
    if (cache) {
      await cache.setCachedCats(json.data);
    }
    const duration = Date.now() - startTime;
    logger.debug('[service][cats] fetched', { duration, count: json.data.length });
    return { success: true, data: json.data };
  } catch (e: any) {
    const duration = Date.now() - startTime;
    logger.error('[service][cats] fetch error', {
      error: e.message || 'Error',
      duration
    });
    return { success: false, error: e.message || 'Error' };
  }
}

async function createCat(data: CreateCatInput): Promise<{ success: boolean; cat?: Cat; error?: string }> {
  const startTime = Date.now();
  try {
    logger.debug('[service][cats] createCat start');

    // Validate input data
    const validationResult = validateData(catFormSchema, data);
    if (!validationResult.success) {
      const duration = Date.now() - startTime;
      logger.error('[service][cats] createCat validation failed', {
        errors: validationResult.errors,
        duration
      });
      const firstError = validationResult.errors?.[0];
      return { success: false, error: firstError?.message || 'Validation failed' };
    }

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      const duration = Date.now() - startTime;
      logger.error('[service][cats] createCat API error', {
        status: res.status,
        error: json.error || 'Failed to add cat',
        duration
      });
      return { success: false, error: json.error || 'Failed to add cat' };
    }
    // Invalidate cache after creating a new cat
    const cache = await getCacheUtils();
    if (cache) {
      await cache.invalidateCatsCache();
    }
    const duration = Date.now() - startTime;
    logger.debug('[service][cats] createCat ok', { id: json.data.id, duration });
    return { success: true, cat: json.data };
  } catch (e: any) {
    const duration = Date.now() - startTime;
    logger.error('[service][cats] createCat error', {
      error: e.message || 'Unexpected error',
      duration
    });
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

async function updateCat(id: number, data: UpdateCatInput): Promise<{ success: boolean; cat?: Cat; error?: string }> {
  try {
    console.debug('[service][cats] updateCat start', { id });

    // Validate input data
    const validationResult = validateData(catUpdateSchema, data);
    if (!validationResult.success) {
      const firstError = validationResult.errors?.[0];
      return { success: false, error: firstError?.message || 'Validation failed' };
    }

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update cat' };
    }
    // Invalidate cache after updating a cat
    const cache = await getCacheUtils();
    if (cache) {
      await cache.invalidateCatsCache();
      await cache.invalidateCatCache(id);
    }
    console.debug('[service][cats] updateCat ok', { id });
    return { success: true, cat: json.data };
  } catch (e: any) {
    console.error('[service][cats] updateCat error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

async function deleteCat(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.debug('[service][cats] deleteCat start', { id });
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to delete cat' };
    }
    // Invalidate cache after deleting a cat
    const cache = await getCacheUtils();
    if (cache) {
      await cache.invalidateCatsCache();
      await cache.invalidateCatCache(id);
    }
    console.debug('[service][cats] deleteCat ok', { id });
    return { success: true };
  } catch (e: any) {
    console.error('[service][cats] deleteCat error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

// Export types for use in hooks and components
export type { CreateCatInput, UpdateCatInput };
export { fetchCats, createCat, updateCat, deleteCat };
