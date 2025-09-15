// Test data factory for creating consistent test data

export interface TestCat {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  dataAiHint: string;
}

export interface TestAdoptionRequest {
  id: number;
  catName: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applicant: {
    name: string;
    email: string;
    phone: string;
    address: string;
    reason: string;
  };
}

export interface TestUser {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export class TestDataFactory {
  private static catIdCounter = 1;
  private static requestIdCounter = 1;
  private static userIdCounter = 1;

  static createCat(overrides: Partial<TestCat> = {}): TestCat {
    const defaultCat: TestCat = {
      id: this.catIdCounter++,
      name: 'Fluffy',
      breed: 'Persian',
      age: 3,
      gender: 'Male',
      description: 'A fluffy Persian cat who loves to play',
      image: 'https://example.com/cat.jpg',
      dataAiHint: 'Friendly and playful',
    };

    return { ...defaultCat, ...overrides };
  }

  static createAdoptionRequest(overrides: Partial<TestAdoptionRequest> = {}): TestAdoptionRequest {
    const defaultRequest: TestAdoptionRequest = {
      id: this.requestIdCounter++,
      catName: 'Fluffy',
      requestDate: new Date().toISOString(),
      status: 'Pending',
      applicant: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      },
    };

    return { ...defaultRequest, ...overrides };
  }

  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    const defaultUser: TestUser = {
      id: `user-${this.userIdCounter++}`,
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'password123',
      name: 'John Doe',
    };

    return { ...defaultUser, ...overrides };
  }

  static createMultipleCats(count: number, overrides: Partial<TestCat> = {}): TestCat[] {
    return Array.from({ length: count }, () => this.createCat(overrides));
  }

  static createMultipleAdoptionRequests(count: number, overrides: Partial<TestAdoptionRequest> = {}): TestAdoptionRequest[] {
    return Array.from({ length: count }, () => this.createAdoptionRequest(overrides));
  }

  static createMultipleUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static resetCounters(): void {
    this.catIdCounter = 1;
    this.requestIdCounter = 1;
    this.userIdCounter = 1;
  }
}
