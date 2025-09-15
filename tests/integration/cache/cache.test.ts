import cacheUtils from '@/lib/cache/cache-utils';
import redisConnection from '@/lib/cache/connection';

// Create mock Redis client
let mockRedisClient: any;

// Mock the Redis connection
jest.mock('@/lib/cache/connection', () => ({
  __esModule: true,
  default: {
    getClient: jest.fn().mockImplementation(() => {
      // Return the mock client or a default object if not initialized
      return mockRedisClient || {
        get: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        keys: jest.fn(),
      };
    }),
  }
}));

beforeEach(() => {
  // Initialize mock Redis client before each test
  mockRedisClient = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  };

  // Clear all mocks
  jest.clearAllMocks();
});

describe('Cache Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CacheUtils', () => {
    describe('get', () => {
      it('should retrieve cached data', async () => {
        const key = 'test-key';
        const value = { id: 1, name: 'Test' };

        mockRedisClient.get.mockResolvedValue(JSON.stringify(value));

        const result = await cacheUtils.get(key);

        expect(result).toEqual(value);
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      });

      it('should return null for non-existent cache key', async () => {
        const key = 'non-existent-key';

        mockRedisClient.get.mockResolvedValue(null);

        const result = await cacheUtils.get(key);

        expect(result).toBeNull();
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      });

      it('should handle cache errors gracefully', async () => {
        const key = 'error-key';

        mockRedisClient.get.mockRejectedValue(new Error('Cache error'));

        const result = await cacheUtils.get(key);

        expect(result).toBeNull();
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
      });
    });

    describe('set', () => {
      it('should set data in cache', async () => {
        const key = 'test-key';
        const value = { id: 1, name: 'Test' };
        const ttl = 300;

        mockRedisClient.setex.mockResolvedValue('OK');

        await cacheUtils.set(key, value, ttl);

        expect(mockRedisClient.setex).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
      });

      it('should handle cache errors when setting', async () => {
        const key = 'test-key';
        const value = { id: 1, name: 'Test' };
        const ttl = 300;

        mockRedisClient.setex.mockRejectedValue(new Error('Cache error'));

        // Should not throw an error
        await expect(cacheUtils.set(key, value, ttl)).resolves.toBeUndefined();
        expect(mockRedisClient.setex).toHaveBeenCalledWith(key, ttl, JSON.stringify(value));
      });
    });

    describe('del', () => {
      it('should delete cache key', async () => {
        const key = 'test-key';

        mockRedisClient.del.mockResolvedValue(1);

        await cacheUtils.del(key);

        expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      });

      it('should handle cache errors when deleting', async () => {
        const key = 'test-key';

        mockRedisClient.del.mockRejectedValue(new Error('Cache error'));

        // Should not throw an error
        await expect(cacheUtils.del(key)).resolves.toBeUndefined();
        expect(mockRedisClient.del).toHaveBeenCalledWith(key);
      });
    });

    describe('invalidateKeys', () => {
      it('should invalidate multiple keys', async () => {
        const pattern = 'cats:item:*';
        const keys = ['cats:item:1', 'cats:item:2'];

        mockRedisClient.keys.mockResolvedValue(keys);
        mockRedisClient.del.mockResolvedValue(2);

        await cacheUtils.invalidateKeys(pattern);

        expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
        expect(mockRedisClient.del).toHaveBeenCalledWith(...keys);
      });

      it('should handle no matching keys', async () => {
        const pattern = 'non-existent:*';

        mockRedisClient.keys.mockResolvedValue([]);

        await cacheUtils.invalidateKeys(pattern);

        expect(mockRedisClient.keys).toHaveBeenCalledWith(pattern);
        expect(mockRedisClient.del).not.toHaveBeenCalled();
      });
    });

    describe('getCachedCats', () => {
      it('should retrieve cached cats list', async () => {
        const cats = [{
          id: 1,
          name: 'Fluffy',
          breed: 'Persian',
          age: 3,
          gender: 'Male' as const,
          description: 'A fluffy Persian cat',
          image: 'https://example.com/cat.jpg',
          dataAiHint: 'Friendly and playful',
        }];

        mockRedisClient.get.mockResolvedValue(JSON.stringify(cats));

        const result = await cacheUtils.getCachedCats();

        expect(result).toEqual(cats);
        expect(mockRedisClient.get).toHaveBeenCalledWith('cats:list');
      });
    });

    describe('setCachedCats', () => {
      it('should cache cats list', async () => {
        const cats = [{
          id: 1,
          name: 'Fluffy',
          breed: 'Persian',
          age: 3,
          gender: 'Male' as const,
          description: 'A fluffy Persian cat',
          image: 'https://example.com/cat.jpg',
          dataAiHint: 'Friendly and playful',
        }];
        const ttl = 300;

        mockRedisClient.setex.mockResolvedValue('OK');

        await cacheUtils.setCachedCats(cats);

        expect(mockRedisClient.setex).toHaveBeenCalledWith('cats:list', ttl, JSON.stringify(cats));
      });
    });

    describe('getCachedCat', () => {
      it('should retrieve cached individual cat', async () => {
        const cat = {
          id: 1,
          name: 'Fluffy',
          breed: 'Persian',
          age: 3,
          gender: 'Male' as const,
          description: 'A fluffy Persian cat',
          image: 'https://example.com/cat.jpg',
          dataAiHint: 'Friendly and playful',
        };
        const id = 1;

        mockRedisClient.get.mockResolvedValue(JSON.stringify(cat));

        const result = await cacheUtils.getCachedCat(id);

        expect(result).toEqual(cat);
        expect(mockRedisClient.get).toHaveBeenCalledWith(`cats:item:${id}`);
      });
    });

    describe('setCachedCat', () => {
      it('should cache individual cat', async () => {
        const cat = {
          id: 1,
          name: 'Fluffy',
          breed: 'Persian',
          age: 3,
          gender: 'Male' as const,
          description: 'A fluffy Persian cat',
          image: 'https://example.com/cat.jpg',
          dataAiHint: 'Friendly and playful',
        };
        const id = 1;
        const ttl = 600;

        mockRedisClient.setex.mockResolvedValue('OK');

        await cacheUtils.setCachedCat(id, cat);

        expect(mockRedisClient.setex).toHaveBeenCalledWith(`cats:item:${id}`, ttl, JSON.stringify(cat));
      });
    });
  });

  describe('RedisConnection', () => {
    it('should return the same instance', () => {
      const instance1 = redisConnection;
      const instance2 = redisConnection;

      expect(instance1).toBe(instance2);
    });

    it('should return Redis client', () => {
      const client = redisConnection.getClient();

      expect(client).toBe(mockRedisClient);
    });
  });
});
