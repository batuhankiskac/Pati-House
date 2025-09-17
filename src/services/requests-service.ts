// Service for adoption request-related API calls and business logic
import type { AdoptionRequest } from '@/lib/data';
import { adoptionRequestSchema } from '@/lib/validation/requests';
import { validateData } from '@/lib/validation/utils';
import type { AdoptionRequestFormData } from '@/lib/validation/requests';
import { API_ENDPOINTS } from '@/lib/config';

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
type CreateRequestInput = AdoptionRequestFormData;

// const API_BASE = '/api/requests';
const API_BASE = API_ENDPOINTS.REQUESTS;

async function fetchRequests(): Promise<{ success: boolean; data?: AdoptionRequest[]; error?: string }> {
  try {
    // Try to get from cache first
    const cache = await getCacheUtils();
    const cachedRequests = cache ? await cache.getCachedRequests() : null;
    if (cachedRequests && cachedRequests.length > 0) {
      console.debug('[service][requests] returning cached list');
      return { success: true, data: cachedRequests };
    }

    console.debug('[service][requests] fetching list');
    const res = await fetch(API_BASE, { cache: 'no-store' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch requests');
    }

    // Cache the result
    if (cache) {
      await cache.setCachedRequests(json.data);
    }
    console.debug('[service][requests] fetched', json.data.length);
    return { success: true, data: json.data };
  } catch (e: any) {
    console.error('[service][requests] fetch error', e);
    return { success: false, error: e.message || 'Error' };
  }
}

async function createRequest(data: CreateRequestInput): Promise<{ success: boolean; request?: AdoptionRequest; error?: string }> {
  try {
    console.debug('[service][requests] createRequest');

    // Validate input data
    const validationResult = validateData(adoptionRequestSchema, data);
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
      return { success: false, error: json.error || 'Failed to create request' };
    }
    // Invalidate cache after creating a new request
    const cacheUtils = await getCacheUtils();
    if (cacheUtils) {
      await cacheUtils.invalidateRequestsCache();
    }
    return { success: true, request: json.data };
  } catch (e: any) {
    console.error('[service][requests] create error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

async function updateStatus(id: number, status: 'Approved' | 'Rejected' | 'Pending'): Promise<{ success: boolean; request?: AdoptionRequest; error?: string }> {
  try {
    console.debug('[service][requests] updateStatus', { id, status });
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to update status' };
    }
    // Invalidate cache after updating a request
    const cacheUtils = await getCacheUtils();
    if (cacheUtils) {
      await cacheUtils.invalidateRequestsCache();
      await cacheUtils.invalidateRequestCache(id);
    }
    return { success: true, request: json.data };
  } catch (e: any) {
    console.error('[service][requests] updateStatus error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

async function deleteRequest(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    console.debug('[service][requests] delete', { id });
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error || 'Failed to delete' };
    }
    // Invalidate cache after deleting a request
    const cacheUtils = await getCacheUtils();
    if (cacheUtils) {
      await cacheUtils.invalidateRequestsCache();
      await cacheUtils.invalidateRequestCache(id);
    }
    return { success: true };
  } catch (e: any) {
    console.error('[service][requests] delete error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

// Export types for use in hooks and components
export type { CreateRequestInput };
export { fetchRequests, createRequest, updateStatus, deleteRequest };
