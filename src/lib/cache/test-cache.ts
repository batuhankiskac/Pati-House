import { catRepository, adoptionRequestRepository } from '@/lib/data';
import cacheUtils from './cache-utils';
import redisConnection from './connection';

/**
 * Simple test script to verify caching functionality
 */

async function testCacheFunctionality() {
  try {
    console.log('Starting cache functionality test...');

    // Test 1: Cache and retrieve cats list
    console.log('\n1. Testing cats list caching...');
    const cats = await catRepository.getAll();
    console.log(`Retrieved ${cats.length} cats from database`);

    // Cache cats list
    await cacheUtils.setCachedCats(cats);
    console.log('Cached cats list');

    // Retrieve cached cats list
    const cachedCats = await cacheUtils.getCachedCats();
    console.log(`Retrieved ${cachedCats?.length || 0} cats from cache`);

    if (JSON.stringify(cats) === JSON.stringify(cachedCats)) {
      console.log('✓ Cats list caching test PASSED');
    } else {
      console.log('✗ Cats list caching test FAILED');
    }

    // Test 2: Cache and retrieve individual cat (if any exist)
    if (cats.length > 0) {
      console.log('\n2. Testing individual cat caching...');
      const cat = cats[0];

      // Cache individual cat
      await cacheUtils.setCachedCat(cat.id, cat);
      console.log(`Cached individual cat with id ${cat.id}`);

      // Retrieve cached cat
      const cachedCat = await cacheUtils.getCachedCat(cat.id);
      console.log(`Retrieved cat with id ${cachedCat?.id} from cache`);

      if (JSON.stringify(cat) === JSON.stringify(cachedCat)) {
        console.log('✓ Individual cat caching test PASSED');
      } else {
        console.log('✗ Individual cat caching test FAILED');
      }
    }

    // Test 3: Cache and retrieve requests list
    console.log('\n3. Testing requests list caching...');
    const requests = await adoptionRequestRepository.getAll();
    console.log(`Retrieved ${requests.length} requests from database`);

    // Cache requests list
    await cacheUtils.setCachedRequests(requests);
    console.log('Cached requests list');

    // Retrieve cached requests list
    const cachedRequests = await cacheUtils.getCachedRequests();
    console.log(`Retrieved ${cachedRequests?.length || 0} requests from cache`);

    if (JSON.stringify(requests) === JSON.stringify(cachedRequests)) {
      console.log('✓ Requests list caching test PASSED');
    } else {
      console.log('✗ Requests list caching test FAILED');
    }

    // Test 4: Cache and retrieve individual request (if any exist)
    if (requests.length > 0) {
      console.log('\n4. Testing individual request caching...');
      const request = requests[0];

      // Cache individual request
      await cacheUtils.setCachedRequest(request.id, request);
      console.log(`Cached individual request with id ${request.id}`);

      // Retrieve cached request
      const cachedRequest = await cacheUtils.getCachedRequest(request.id);
      console.log(`Retrieved request with id ${cachedRequest?.id} from cache`);

      if (JSON.stringify(request) === JSON.stringify(cachedRequest)) {
        console.log('✓ Individual request caching test PASSED');
      } else {
        console.log('✗ Individual request caching test FAILED');
      }
    }

    // Test 5: Cache invalidation
    console.log('\n5. Testing cache invalidation...');

    // Invalidate cats cache
    await cacheUtils.invalidateCatsCache();
    console.log('Invalidated cats cache');

    // Try to retrieve invalidated cache
    const invalidatedCats = await cacheUtils.getCachedCats();
    if (invalidatedCats === null) {
      console.log('✓ Cats cache invalidation test PASSED');
    } else {
      console.log('✗ Cats cache invalidation test FAILED');
    }

    // Invalidate requests cache
    await cacheUtils.invalidateRequestsCache();
    console.log('Invalidated requests cache');

    // Try to retrieve invalidated cache
    const invalidatedRequests = await cacheUtils.getCachedRequests();
    if (invalidatedRequests === null) {
      console.log('✓ Requests cache invalidation test PASSED');
    } else {
      console.log('✗ Requests cache invalidation test FAILED');
    }

    console.log('\nAll cache functionality tests completed!');

  } catch (error) {
    console.error('Error during cache functionality test:', error);
 }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCacheFunctionality().then(() => {
    console.log('Test completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export default testCacheFunctionality;
