import redisConnection from './connection';
import { Cat, AdoptionRequest } from '@/lib/data';
import { CACHE_TTL } from '@/lib/config';

// const CACHE_TTL = {
//   CATS_LIST: 300, // 5 minutes
//   CATS_ITEM: 600, // 10 minutes
//   REQUESTS_LIST: 300, // 5 minutes
//   REQUESTS_ITEM: 600, // 10 minutes
// };

// Cache keys
const CACHE_KEYS = {
  CATS_LIST: 'cats:list',
  CATS_ITEM: (id: number) => `cats:item:${id}`,
  REQUESTS_LIST: 'requests:list',
  REQUESTS_ITEM: (id: number) => `requests:item:${id}`,
};

class CacheUtils {
  private client = redisConnection.getClient();

  // Get cached data
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.client.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
      return null;
    } catch (error) {
      console.error(`[Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  // Set data in cache
  async set<T>(key: string, data: T, ttl: number = 300): Promise<void> {
    try {
      await this.client.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error(`[Cache] Error setting key ${key}:`, error);
    }
  }

  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`[Cache] Error deleting key ${key}:`, error);
    }
  }

  // Invalidate multiple keys
  async invalidateKeys(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error(`[Cache] Error invalidating pattern ${pattern}:`, error);
    }
  }

  // Invalidate all cats cache
  async invalidateCatsCache(): Promise<void> {
    try {
      await this.del(CACHE_KEYS.CATS_LIST);
      await this.invalidateKeys('cats:item:*');
    } catch (error) {
      console.error('[Cache] Error invalidating cats cache:', error);
    }
  }

  // Invalidate all requests cache
  async invalidateRequestsCache(): Promise<void> {
    try {
      await this.del(CACHE_KEYS.REQUESTS_LIST);
      await this.invalidateKeys('requests:item:*');
    } catch (error) {
      console.error('[Cache] Error invalidating requests cache:', error);
    }
  }

  // Invalidate specific cat cache
  async invalidateCatCache(id: number): Promise<void> {
    try {
      await this.del(CACHE_KEYS.CATS_ITEM(id));
    } catch (error) {
      console.error(`[Cache] Error invalidating cat cache for id ${id}:`, error);
    }
  }

  // Invalidate specific request cache
  async invalidateRequestCache(id: number): Promise<void> {
    try {
      await this.del(CACHE_KEYS.REQUESTS_ITEM(id));
    } catch (error) {
      console.error(`[Cache] Error invalidating request cache for id ${id}:`, error);
    }
  }

  // Cache cats list
  async getCachedCats(): Promise<Cat[] | null> {
    return this.get<Cat[]>(CACHE_KEYS.CATS_LIST);
  }

  async setCachedCats(cats: Cat[]): Promise<void> {
    await this.set(CACHE_KEYS.CATS_LIST, cats, CACHE_TTL.CATS_LIST);
  }

  // Cache single cat
  async getCachedCat(id: number): Promise<Cat | null> {
    return this.get<Cat>(CACHE_KEYS.CATS_ITEM(id));
  }

  async setCachedCat(id: number, cat: Cat): Promise<void> {
    await this.set(CACHE_KEYS.CATS_ITEM(id), cat, CACHE_TTL.CATS_ITEM);
  }

 // Cache requests list
  async getCachedRequests(): Promise<AdoptionRequest[] | null> {
    return this.get<AdoptionRequest[]>(CACHE_KEYS.REQUESTS_LIST);
  }

  async setCachedRequests(requests: AdoptionRequest[]): Promise<void> {
    await this.set(CACHE_KEYS.REQUESTS_LIST, requests, CACHE_TTL.REQUESTS_LIST);
  }

  // Cache single request
  async getCachedRequest(id: number): Promise<AdoptionRequest | null> {
    return this.get<AdoptionRequest>(CACHE_KEYS.REQUESTS_ITEM(id));
  }

  async setCachedRequest(id: number, request: AdoptionRequest): Promise<void> {
    await this.set(CACHE_KEYS.REQUESTS_ITEM(id), request, CACHE_TTL.REQUESTS_ITEM);
  }
}

const cacheUtils = new CacheUtils();
export default cacheUtils;
