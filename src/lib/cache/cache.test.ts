import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Cat, AdoptionRequest } from '@/lib/data';
import cacheUtils from './cache-utils';
import redisConnection from './connection';

// Mock data
const mockCat: Cat = {
  id: 1,
  name: 'Test Cat',
  breed: 'Test Breed',
  age: 2,
  gender: 'Male',
  description: 'Test description',
  image: 'test.jpg',
  dataAiHint: 'Test hint'
};

const mockRequest: AdoptionRequest = {
  id: 1,
  catName: 'Test Cat',
  requestDate: '2023-01-01',
  status: 'Pending',
  applicant: {
    name: 'Test Applicant',
    email: 'test@example.com',
    phone: '1234567890',
    address: 'Test Address',
    reason: 'Test Reason'
  }
};

describe('Cache Utils', () => {
  beforeEach(async () => {
    // Clear cache before each test
    const client = redisConnection.getClient();
    await client.flushall();
  });

  afterEach(async () => {
    // Clear cache after each test
    const client = redisConnection.getClient();
    await client.flushall();
  });

  it('should cache and retrieve cats list', async () => {
    const cats = [mockCat];

    // Cache cats list
    await cacheUtils.setCachedCats(cats);

    // Retrieve cached cats list
    const cachedCats = await cacheUtils.getCachedCats();

    expect(cachedCats).toEqual(cats);
  });

  it('should cache and retrieve individual cat', async () => {
    // Cache individual cat
    await cacheUtils.setCachedCat(mockCat.id, mockCat);

    // Retrieve cached cat
    const cachedCat = await cacheUtils.getCachedCat(mockCat.id);

    expect(cachedCat).toEqual(mockCat);
  });

  it('should cache and retrieve requests list', async () => {
    const requests = [mockRequest];

    // Cache requests list
    await cacheUtils.setCachedRequests(requests);

    // Retrieve cached requests list
    const cachedRequests = await cacheUtils.getCachedRequests();

    expect(cachedRequests).toEqual(requests);
  });

  it('should cache and retrieve individual request', async () => {
    // Cache individual request
    await cacheUtils.setCachedRequest(mockRequest.id, mockRequest);

    // Retrieve cached request
    const cachedRequest = await cacheUtils.getCachedRequest(mockRequest.id);

    expect(cachedRequest).toEqual(mockRequest);
  });

  it('should invalidate cats cache', async () => {
    const cats = [mockCat];

    // Cache cats list
    await cacheUtils.setCachedCats(cats);

    // Verify cache is set
    const cachedCats = await cacheUtils.getCachedCats();
    expect(cachedCats).toEqual(cats);

    // Invalidate cache
    await cacheUtils.invalidateCatsCache();

    // Verify cache is invalidated
    const invalidatedCats = await cacheUtils.getCachedCats();
    expect(invalidatedCats).toBeNull();
  });

  it('should invalidate requests cache', async () => {
    const requests = [mockRequest];

    // Cache requests list
    await cacheUtils.setCachedRequests(requests);

    // Verify cache is set
    const cachedRequests = await cacheUtils.getCachedRequests();
    expect(cachedRequests).toEqual(requests);

    // Invalidate cache
    await cacheUtils.invalidateRequestsCache();

    // Verify cache is invalidated
    const invalidatedRequests = await cacheUtils.getCachedRequests();
    expect(invalidatedRequests).toBeNull();
  });
});
