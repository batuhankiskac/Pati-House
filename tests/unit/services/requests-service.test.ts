import { fetchRequests, createRequest, updateStatus, deleteRequest } from '@/services/requests-service';
import * as cacheUtils from '@/lib/cache/cache-utils';
import * as validationUtils from '@/lib/validation/utils';
import { adoptionRequestSchema } from '@/lib/validation/requests';

// Mock the cache utilities
jest.mock('@/lib/cache/cache-utils', () => ({
  __esModule: true,
  default: {
    getCachedRequests: jest.fn(),
    setCachedRequests: jest.fn(),
    invalidateRequestsCache: jest.fn(),
    invalidateRequestCache: jest.fn(),
  },
}));

// Mock the validation utilities
jest.mock('@/lib/validation/utils', () => ({
  __esModule: true,
  validateData: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Requests Service', () => {
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

  const mockRequests = [mockRequest];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRequests', () => {
    it('should return cached requests when available', async () => {
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(mockRequests);

      const result = await fetchRequests();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequests);
      expect(cacheUtils.default.getCachedRequests).toHaveBeenCalled();
    });

    it('should fetch requests from API when not cached', async () => {
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockRequests,
        }),
      });

      const result = await fetchRequests();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRequests);
      expect(cacheUtils.default.getCachedRequests).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/requests', { cache: 'no-store' });
      expect(cacheUtils.default.setCachedRequests).toHaveBeenCalledWith(mockRequests);
    });

    it('should handle API errors', async () => {
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to fetch requests',
        }),
      });

      const result = await fetchRequests();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch requests');
    });

    it('should handle network errors', async () => {
      (cacheUtils.default.getCachedRequests as jest.Mock).mockResolvedValue(null);
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await fetchRequests();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
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

    it('should create a request successfully', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validRequestData,
      });
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
      expect(validationUtils.validateData).toHaveBeenCalledWith(adoptionRequestSchema, validRequestData);
      expect(global.fetch).toHaveBeenCalledWith('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validRequestData),
      });
      expect(cacheUtils.default.invalidateRequestsCache).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: false,
        errors: [{ path: 'catName', message: 'Cat name is required' }],
      });

      const result = await createRequest({} as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cat name is required');
    });

    it('should handle API errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validRequestData,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to create request',
        }),
      });

      const result = await createRequest(validRequestData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create request');
    });

    it('should handle network errors', async () => {
      (validationUtils.validateData as jest.Mock).mockReturnValue({
        success: true,
        data: validRequestData,
      });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await createRequest(validRequestData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateStatus', () => {
    it('should update request status successfully', async () => {
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

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to update status',
        }),
      });

      const result = await updateStatus(1, 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update status');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await updateStatus(1, 'Approved');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('deleteRequest', () => {
    it('should delete a request successfully', async () => {
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

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Failed to delete',
        }),
      });

      const result = await deleteRequest(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await deleteRequest(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
