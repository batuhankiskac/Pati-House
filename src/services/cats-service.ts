// Service for cat-related API calls and business logic
import type { Cat } from '@/lib/data';
import cacheUtils from '@/lib/cache/cache-utils';
import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';
import { validateData } from '@/lib/validation/utils';
import type { CatFormData, CatUpdateData } from '@/lib/validation/cats';


type CreateCatInput = CatFormData;
type UpdateCatInput = CatUpdateData;
const API_BASE = '/api/cats';

async function fetchCats(): Promise<{ success: boolean; data?: Cat[]; error?: string }> {
  try {
    // Try to get from cache first
    const cachedCats = await cacheUtils.getCachedCats();
    if (cachedCats) {
      console.debug('[service][cats] returning cached list');
      return { success: true, data: cachedCats };
    }

    console.debug('[service][cats] fetching list');
    const res = await fetch(API_BASE, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch list');
    }

    // Cache the result
    await cacheUtils.setCachedCats(json.data);
    console.debug('[service][cats] fetched', json.data.length);
    return { success: true, data: json.data };
  } catch (e: any) {
    console.error('[service][cats] fetch error', e);
    return { success: false, error: e.message || 'Error' };
  }
}

async function createCat(data: CreateCatInput): Promise<{ success: boolean; cat?: Cat; error?: string }> {
  try {
    console.debug('[service][cats] createCat start');

    // Validate input data
    const validationResult = validateData(catFormSchema, data);
    if (!validationResult.success) {
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
      return { success: false, error: json.error || 'Failed to add cat' };
    }
    // Invalidate cache after creating a new cat
    await cacheUtils.invalidateCatsCache();
    console.debug('[service][cats] createCat ok id', json.data.id);
    return { success: true, cat: json.data };
  } catch (e: any) {
    console.error('[service][cats] createCat error', e);
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
    await cacheUtils.invalidateCatsCache();
    await cacheUtils.invalidateCatCache(id);
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
    await cacheUtils.invalidateCatsCache();
    await cacheUtils.invalidateCatCache(id);
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
