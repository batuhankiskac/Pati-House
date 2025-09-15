import { createCat, updateCat, deleteCat } from '@/services/cats-service';
import * as cacheUtils from '@/lib/cache/cache-utils';

// Mock the cache utilities
jest.mock('@/lib/cache/cache-utils', () => ({
  __esModule: true,
  default: {
    getCachedCats: jest.fn(),
    setCachedCats: jest.fn(),
    invalidateCatsCache: jest.fn(),
    invalidateCatCache: jest.fn(),
    getCachedCat: jest.fn(),
    setCachedCat: jest.fn(),
 },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Cats API Integration', () => {
 const mockCat = {
    id: 1,
    name: 'Fluffy',
    breed: 'Persian',
    age: 3,
    gender: 'Male' as const,
    description: 'A fluffy Persian cat',
    image: 'https://example.com/cat.jpg',
    dataAiHint: 'Friendly and playful',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCat', () => {
    const validCatData = {
      name: 'Fluffy',
      breed: 'Persian',
      age: 3,
      gender: 'Male' as const,
      description: 'A fluffy Persian cat',
      image: 'https://example.com/cat.jpg',
    };

    it('should successfully create a cat', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockCat,
        }),
      });

      const result = await createCat(validCatData);

      expect(result.success).toBe(true);
      expect(result.cat).toEqual(mockCat);
      expect(global.fetch).toHaveBeenCalledWith('/api/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCatData),
      });
      expect(cacheUtils.default.invalidateCatsCache).toHaveBeenCalled();
    });

    it('should handle API validation errors', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);

      // Mock API validation error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Name is required',
        }),
      });

      const result = await createCat({ ...validCatData, name: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should handle network errors', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await createCat(validCatData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateCat', () => {
    const validUpdateData = {
      name: 'Fluffy Updated',
    };

    it('should successfully update a cat', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockCat, name: 'Fluffy Updated' },
        }),
      });

      const result = await updateCat(1, validUpdateData);

      expect(result.success).toBe(true);
      expect(result.cat).toEqual({ ...mockCat, name: 'Fluffy Updated' });
      expect(global.fetch).toHaveBeenCalledWith('/api/cats/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUpdateData),
      });
      expect(cacheUtils.default.invalidateCatsCache).toHaveBeenCalled();
      expect(cacheUtils.default.invalidateCatCache).toHaveBeenCalledWith(1);
    });

    it('should handle API errors when updating', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Cat not found',
        }),
      });

      const result = await updateCat(999, validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cat not found');
    });

    it('should handle network errors when updating', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await updateCat(1, validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('deleteCat', () => {
    it('should successfully delete a cat', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
        }),
      });

      const result = await deleteCat(1);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/cats/1', {
        method: 'DELETE',
      });
      expect(cacheUtils.default.invalidateCatsCache).toHaveBeenCalled();
      expect(cacheUtils.default.invalidateCatCache).toHaveBeenCalledWith(1);
    });

    it('should handle API errors when deleting', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Cat not found',
        }),
      });

      const result = await deleteCat(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cat not found');
    });

    it('should handle network errors when deleting', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await deleteCat(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
