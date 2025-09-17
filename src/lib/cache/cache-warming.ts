import { catRepository, adoptionRequestRepository } from '@/lib/data';
import cacheUtils from './cache-utils';

/**
 * Cache warming utility to pre-populate cache with frequently accessed data
 */

export async function warmUpCache(): Promise<void> {
  try {
    console.log('[Cache] Starting cache warming...');

    // Warm up cats cache
    const cats = await catRepository.getAll();
    await cacheUtils.setCachedCats(cats);
    console.log(`[Cache] Warmed up cats cache with ${cats.length} items`);

    // Warm up requests cache
    const requests = await adoptionRequestRepository.getAll();
    await cacheUtils.setCachedRequests(requests);
    console.log(`[Cache] Warmed up requests cache with ${requests.length} items`);

    console.log('[Cache] Cache warming completed successfully');
  } catch (error) {
    console.error('[Cache] Error during cache warming:', error);
 }
}

export async function warmUpIndividualCats(): Promise<void> {
  try {
    console.log('[Cache] Starting individual cats cache warming...');

    const cats = await catRepository.getAll();
    for (const cat of cats) {
      await cacheUtils.setCachedCat(cat.id, cat);
    }

    console.log(`[Cache] Warmed up individual cats cache with ${cats.length} items`);
  } catch (error) {
    console.error('[Cache] Error during individual cats cache warming:', error);
  }
}

export async function warmUpIndividualRequests(): Promise<void> {
  try {
    console.log('[Cache] Starting individual requests cache warming...');

    const requests = await adoptionRequestRepository.getAll();
    for (const request of requests) {
      await cacheUtils.setCachedRequest(request.id, request);
    }

    console.log(`[Cache] Warmed up individual requests cache with ${requests.length} items`);
  } catch (error) {
    console.error('[Cache] Error during individual requests cache warming:', error);
  }
}

// Export a function that warms up all caches
export async function warmUpAllCaches(): Promise<void> {
  await warmUpCache();
  await warmUpIndividualCats();
  await warmUpIndividualRequests();
}

export default {
  warmUpCache,
  warmUpIndividualCats,
  warmUpIndividualRequests,
  warmUpAllCaches
};
