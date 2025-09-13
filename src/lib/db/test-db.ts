import { CatRepository, AdoptionRequestRepository, UserRepository } from './repositories';

async function testDatabaseOperations() {
 console.log('Testing database operations...');

  try {
    // Test cat operations
    console.log('\n1. Testing cat operations...');

    // Create a cat
    const newCat = await CatRepository.create({
      name: 'Test Cat',
      breed: 'Test Breed',
      age: 2,
      gender: 'Male',
      description: 'A test cat for database operations',
      image: 'test-image.jpg',
      dataAiHint: 'Test AI hint'
    });
    console.log('Created cat:', newCat);

    // Get all cats
    const allCats = await CatRepository.getAll();
    console.log('All cats count:', allCats.length);

    // Get cat by ID
    const catById = await CatRepository.getById(newCat.id);
    console.log('Cat by ID:', catById);

    // Update cat
    const updatedCat = await CatRepository.update(newCat.id, {
      name: 'Updated Test Cat',
      age: 3
    });
    console.log('Updated cat:', updatedCat);

    // Test adoption request operations
    console.log('\n2. Testing adoption request operations...');

    // Create an adoption request
    const newRequest = await AdoptionRequestRepository.create({
      catName: 'Test Cat',
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Bekliyor',
      applicant: {
        name: 'Test Applicant',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test Street',
        reason: 'I love cats and want to adopt one'
      }
    });
    console.log('Created adoption request:', newRequest);

    // Get all requests
    const allRequests = await AdoptionRequestRepository.getAll();
    console.log('All requests count:', allRequests.length);

    // Get request by ID
    const requestById = await AdoptionRequestRepository.getById(newRequest.id);
    console.log('Request by ID:', requestById);

    // Update request
    const updatedRequest = await AdoptionRequestRepository.update(newRequest.id, {
      status: 'Onaylandı'
    });
    console.log('Updated request:', updatedRequest);

    // Test user operations
    console.log('\n3. Testing user operations...');

    // Create a user
    const newUser = await UserRepository.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'hashed_password_here',
      name: 'Test User'
    });
    console.log('Created user:', newUser);

    // Get user by ID
    const userById = await UserRepository.getById(newUser.id);
    console.log('User by ID:', userById);

    // Get user by username
    const userByUsername = await UserRepository.getByUsername('testuser');
    console.log('User by username:', userByUsername);

    // Update user
    const updatedUser = await UserRepository.update(newUser.id, {
      name: 'Updated Test User'
    });
    console.log('Updated user:', updatedUser);

    console.log('\n✅ All database operations completed successfully!');

  } catch (error) {
    console.error('❌ Error during database operations:', error);
  }
}

// Run the test
testDatabaseOperations();
