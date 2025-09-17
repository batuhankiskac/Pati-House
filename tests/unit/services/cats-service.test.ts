import { fetchCats, createCat, updateCat, deleteCat } from '@/services/cats-service';
import * as cacheUtils from '@/lib/cache/cache-utils';
import * as validationUtils from '@/lib/validation/utils';
import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';

// Mock the cache utilities
jest.mock('@/lib/cache/cache-utils', () => ({
  __esModule: true,
  default: {
    getCachedCats: jest.fn(),
    setCachedCats: jest.fn(),
    invalidateCatsCache: jest.fn(),
    invalidateCatCache: jest.fn(),
  },
}));

// Mock the validation utilities
jest.mock('@/lib/validation/utils', () => ({
  __esModule: true,
  validateData: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Cats Service', () => {
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

  const mockCats = [mockCat];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCats', () => {
    it('should return cached cats when available', async () => {
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(mockCats);

      const result = await fetchCats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCats);
      expect(cacheUtils.default.getCachedCats).toHaveBeenCalled();
    });

    it('should fetch cats from API when not cached', async () => {
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockCats,
        }),
      });

      const result = await fetchCats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCats);
      expect(cacheUtils.default.getCachedCats).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/cats', { cache: 'no-store' });
      expect(cacheUtils.default.setCachedCats).toHaveBeenCalledWith(mockCats);
    });

    it('should handle API errors', async () => {
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to fetch cats',
        }),
      });

      const result = await fetchCats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch cats');
    });

    it('should handle network errors', async () => {
      (cacheUtils.default.getCachedCats as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await fetchCats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
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

    it('should create a cat successfully', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validCatData,
      });
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
      expect(validationUtils.validateData).toHaveBeenCalledWith(catFormSchema, validCatData);
      expect(global.fetch).toHaveBeenCalledWith('/api/cats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCatData),
      });
      expect(cacheUtils.default.invalidateCatsCache).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: false,
        errors: [{ path: 'name', message: 'Name is required' }],
      });

      const result = await createCat({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should handle API errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validCatData,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to add cat',
        }),
      });

      const result = await createCat(validCatData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to add cat');
    });

    it('should handle network errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validCatData,
      });
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

    it('should update a cat successfully', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validUpdateData,
      });
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
      expect(validationUtils.validateData).toHaveBeenCalledWith(catUpdateSchema, validUpdateData);
      expect(global.fetch).toHaveBeenCalledWith('/api/cats/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUpdateData),
      });
      expect(cacheUtils.default.invalidateCatsCache).toHaveBeenCalled();
      expect(cacheUtils.default.invalidateCatCache).toHaveBeenCalledWith(1);
    });

    it('should handle validation errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: false,
        errors: [{ path: 'name', message: 'Name is required' }],
      });

      const result = await updateCat(1, {} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Name is required');
    });

    it('should handle API errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validUpdateData,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to update cat',
        }),
      });

      const result = await updateCat(1, validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update cat');
    });

    it('should handle network errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validUpdateData,
      });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await updateCat(1, validUpdateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('deleteCat', () => {
    it('should delete a cat successfully', async () => {
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

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to delete cat',
        }),
      });

      const result = await deleteCat(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete cat');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await deleteCat(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
