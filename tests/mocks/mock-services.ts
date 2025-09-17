// Mock services for testing

import { TestCat, TestAdoptionRequest, TestUser, TestDataFactory } from '../utils/test-data-factory';

// Mock Cats Service
export class MockCatsService {
  private cats: TestCat[] = [];

  constructor() {
    // Initialize with some test data
    this.cats = TestDataFactory.createMultipleCats(5);
  }

  async fetchCats() {
    return { success: true, data: this.cats };
  }

  async createCat(data: Omit<TestCat, 'id'>) {
    const newCat = { ...data, id: this.cats.length + 1 };
    this.cats.push(newCat);
    return { success: true, cat: newCat };
  }

  async updateCat(id: number, updates: Partial<TestCat>) {
    const index = this.cats.findIndex(cat => cat.id === id);
    if (index === -1) {
      return { success: false, error: 'Cat not found' };
    }

    this.cats[index] = { ...this.cats[index], ...updates };
    return { success: true, cat: this.cats[index] };
  }

  async deleteCat(id: number) {
    const index = this.cats.findIndex(cat => cat.id === id);
    if (index === -1) {
      return { success: false, error: 'Cat not found' };
    }

    this.cats.splice(index, 1);
    return { success: true };
  }

  getCats() {
    return this.cats;
  }
}

// Mock Requests Service
export class MockRequestsService {
  private requests: TestAdoptionRequest[] = [];

  constructor() {
    // Initialize with some test data
    this.requests = TestDataFactory.createMultipleAdoptionRequests(3);
  }

  async fetchRequests() {
    return { success: true, data: this.requests };
  }

  async createRequest(data: Omit<TestAdoptionRequest, 'id' | 'requestDate' | 'status'>) {
    const newRequest: TestAdoptionRequest = {
      ...data,
      id: this.requests.length + 1,
      requestDate: new Date().toISOString(),
      status: 'Pending',
    };
    this.requests.push(newRequest);
    return { success: true, request: newRequest };
  }

  async updateStatus(id: number, status: 'Approved' | 'Rejected' | 'Pending') {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) {
      return { success: false, error: 'Request not found' };
    }

    this.requests[index].status = status;
    return { success: true, request: this.requests[index] };
  }

  async deleteRequest(id: number) {
    const index = this.requests.findIndex(request => request.id === id);
    if (index === -1) {
      return { success: false, error: 'Request not found' };
    }

    this.requests.splice(index, 1);
    return { success: true };
  }

  getRequests() {
    return this.requests;
  }
}

// Mock Users Service
export class MockUsersService {
  private users: TestUser[] = [];

  constructor() {
    // Initialize with some test data
    this.users = [
      TestDataFactory.createUser({ username: 'admin', email: 'admin@example.com' }),
      TestDataFactory.createUser({ username: 'user1', email: 'user1@example.com' }),
    ];
  }

  async authenticateUser(username: string, password: string) {
    const user = this.users.find(u => u.username === username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // In a real implementation, we would check the password hash
    // For mocking purposes, we'll just check if the password matches
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    return { success: true, user };
  }

  async registerUser(username: string, email: string, password: string, name: string) {
    // Check if user already exists
    if (this.users.some(u => u.username === username || u.email === email)) {
      return { success: false, error: 'User already exists' };
    }

    const newUser: TestUser = {
      id: `user-${this.users.length + 1}`,
      username,
      email,
      password, // In a real implementation, this would be hashed
      name,
    };

    this.users.push(newUser);
    return { success: true, user: newUser };
  }

  getUsers() {
    return this.users;
  }
}

// Mock Cache Service
export class MockCacheService {
  private cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const value = this.cache.get(key);
    return value ? JSON.parse(JSON.stringify(value)) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    this.cache.set(key, JSON.parse(JSON.stringify(value)));
    // In a real implementation, we would handle TTL
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async invalidateKeys(pattern: string): Promise<void> {
    // Simple pattern matching for testing
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Specific cache methods for cats
  async getCachedCats(): Promise<TestCat[] | null> {
    return this.get<TestCat[]>('cats:list');
  }

  async setCachedCats(cats: TestCat[]): Promise<void> {
    await this.set('cats:list', cats);
  }

  async getCachedCat(id: number): Promise<TestCat | null> {
    return this.get<TestCat>(`cats:item:${id}`);
  }

  async setCachedCat(id: number, cat: TestCat): Promise<void> {
    await this.set(`cats:item:${id}`, cat);
  }

 // Specific cache methods for requests
  async getCachedRequests(): Promise<TestAdoptionRequest[] | null> {
    return this.get<TestAdoptionRequest[]>('requests:list');
  }

  async setCachedRequests(requests: TestAdoptionRequest[]): Promise<void> {
    await this.set('requests:list', requests);
  }

  async getCachedRequest(id: number): Promise<TestAdoptionRequest | null> {
    return this.get<TestAdoptionRequest>(`requests:item:${id}`);
  }

  async setCachedRequest(id: number, request: TestAdoptionRequest): Promise<void> {
    await this.set(`requests:item:${id}`, request);
  }
}
