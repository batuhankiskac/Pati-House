import { createRequest, updateStatus, deleteRequest } from '@/services/requests-service';
import * as cacheUtils from '@/lib/cache/cache-utils';

// Mock the cache utilities
jest.mock('@/lib/cache/cache-utils', () => ({
  __esModule: true,
  default: {
    getCachedRequests: jest.fn(),
    setCachedRequests: jest.fn(),
    invalidateRequestsCache: jest.fn(),
    invalidateRequestCache: jest.fn(),
    getCachedRequest: jest.fn(),
    setCachedRequest: jest.fn(),
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Requests API Integration', () => {
  const mockRequest = {
    id: 1,
    catName: 'Fluffy',
    requestDate: '2023-01-01',
    status: 'Pending' as const,
    applicant: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      reason: 'I love cats',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    const validRequestData = {
      catName: 'Fluffy',
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '1234567890',
      address: '123 Main St',
      reason: 'I love cats and want to adopt Fluffy',
    };

    it('should successfully create a request', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);

      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockRequest,
        }),
      });

      const result = await createRequest(validRequestData);

      expect(result.success).toBe(true);
      expect(result.request).toEqual(mockRequest);
      expect(global.fetch).toHaveBeenCalledWith('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validRequestData),
      });
      expect(cacheUtils.default.invalidateRequestsCache).toHaveBeenCalled();
    });

    it('should handle API validation errors', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);

      // Mock API validation error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Cat name is required',
        }),
      });

      const result = await createRequest({ ...validRequestData, catName: '' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cat name is required');
    });

    it('should handle network errors', async () => {
      // Mock cache to return null (not cached)
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await createRequest(validRequestData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateStatus', () => {
    it('should successfully update request status', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { ...mockRequest, status: 'Approved' as const },
        }),
      });

      const result = await updateStatus(1, 'Approved');

      expect(result.success).toBe(true);
      expect(result.request).toEqual({ ...mockRequest, status: 'Approved' });
      expect(global.fetch).toHaveBeenCalledWith('/api/requests/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      expect(cacheUtils.default.invalidateRequestsCache).toHaveBeenCalled();
      expect(cacheUtils.default.invalidateRequestCache).toHaveBeenCalledWith(1);
    });

    it('should handle API errors when updating status', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Request not found',
        }),
      });

      const result = await updateStatus(99, 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request not found');
    });

    it('should handle network errors when updating status', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await updateStatus(1, 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('deleteRequest', () => {
    it('should successfully delete a request', async () => {
      // Mock successful API response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
        }),
      });

      const result = await deleteRequest(1);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/requests/1', {
        method: 'DELETE',
      });
      expect(cacheUtils.default.invalidateRequestsCache).toHaveBeenCalled();
      expect(cacheUtils.default.invalidateRequestCache).toHaveBeenCalledWith(1);
    });

    it('should handle API errors when deleting', async () => {
      // Mock API error response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Request not found',
        }),
      });

      const result = await deleteRequest(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Request not found');
    });

    it('should handle network errors when deleting', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await deleteRequest(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
