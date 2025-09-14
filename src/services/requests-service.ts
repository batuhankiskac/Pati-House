// Service for adoption request-related API calls and business logic
import type { AdoptionRequest } from '@/lib/data';
import cacheUtils from '@/lib/cache/cache-utils';

export type CreateRequestInput = {
  catName: string;
  fullName: string;
  email: string;
 phone: string;
 address: string;
  reason: string;
};

const API_BASE = '/api/requests';

async function fetchRequests(): Promise<{ success: boolean; data?: AdoptionRequest[]; error?: string }> {
  try {
    // Try to get from cache first
    const cachedRequests = await cacheUtils.getCachedRequests();
    if (cachedRequests) {
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
    await cacheUtils.setCachedRequests(json.data);
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
    await cacheUtils.invalidateRequestsCache();
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
    await cacheUtils.invalidateRequestsCache();
    await cacheUtils.invalidateRequestCache(id);
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
    await cacheUtils.invalidateRequestsCache();
    await cacheUtils.invalidateRequestCache(id);
    return { success: true };
  } catch (e: any) {
    console.error('[service][requests] delete error', e);
    return { success: false, error: e.message || 'Unexpected error' };
  }
}

// Export types for use in hooks and components
export { fetchRequests, createRequest, updateStatus, deleteRequest };
