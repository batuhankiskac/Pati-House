import { registerUser, authenticateUser, getUserById, generateToken, verifyToken, createSession } from '@/lib/auth';
import { userRepository } from '@/lib/data';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the user repository
jest.mock('@/lib/data', () => ({
  userRepository: {
    getByUsername: jest.fn(),
    getByEmail: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
 verify: jest.fn(),
}));

describe('Authentication Integration', () => {
  const mockUser = {
    id: '1',
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'hashed_password',
    name: 'John Doe',
    avatar: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    const userData = {
      username: 'janedoe',
      email: 'jane.doe@example.com',
      password: 'password123',
      name: 'Jane Doe',
    };

    it('should successfully register a new user', async () => {
      // Mock that user doesn't exist
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.getByEmail as jest.Mock).mockResolvedValue(null);

      // Mock bcrypt hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      // Mock user creation
      (userRepository.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        id: '2',
        username: userData.username,
        email: userData.email,
        name: userData.name,
      });

      const result = await registerUser(userData.username, userData.email, userData.password, userData.name);

      expect(result).toEqual({
        ...mockUser,
        id: '2',
        username: userData.username,
        email: userData.email,
        name: userData.name,
      });
      expect(userRepository.getByUsername).toHaveBeenCalledWith(userData.username);
      expect(userRepository.getByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: 'hashed_password',
        name: userData.name,
        avatar: undefined,
      });
    });

    it('should return null if username already exists', async () => {
      // Mock that user already exists
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      const result = await registerUser(userData.username, userData.email, userData.password, userData.name);

      expect(result).toBeNull();
      expect(userRepository.getByUsername).toHaveBeenCalledWith(userData.username);
      expect(userRepository.getByEmail).not.toHaveBeenCalled();
    });

    it('should return null if email already exists', async () => {
      // Mock that username doesn't exist but email does
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.getByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await registerUser(userData.username, userData.email, userData.password, userData.name);

      expect(result).toBeNull();
      expect(userRepository.getByUsername).toHaveBeenCalledWith(userData.username);
      expect(userRepository.getByEmail).toHaveBeenCalledWith(userData.email);
    });

    it('should handle errors during registration', async () => {
      // Mock that user doesn't exist
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(null);
      (userRepository.getByEmail as jest.Mock).mockResolvedValue(null);

      // Mock bcrypt hash error
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      const result = await registerUser(userData.username, userData.email, userData.password, userData.name);

      expect(result).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    it('should successfully authenticate a user with correct credentials', async () => {
      // Mock user found
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      // Mock password match
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authenticateUser('johndoe', 'password123');

      expect(result).toEqual(mockUser);
      expect(userRepository.getByUsername).toHaveBeenCalledWith('johndoe');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return null for non-existent user', async () => {
      // Mock user not found
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(null);

      const result = await authenticateUser('nonexistent', 'password123');

      expect(result).toBeNull();
      expect(userRepository.getByUsername).toHaveBeenCalledWith('nonexistent');
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null for incorrect password', async () => {
      // Mock user found
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      // Mock password mismatch
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authenticateUser('johndoe', 'wrongpassword');

      expect(result).toBeNull();
      expect(userRepository.getByUsername).toHaveBeenCalledWith('johndoe');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });

    it('should handle errors during authentication', async () => {
      // Mock user found
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(mockUser);

      // Mock bcrypt compare error
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Compare error'));

      const result = await authenticateUser('johndoe', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should retrieve a user by ID', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(mockUser);

      const result = await getUserById('1');

      expect(result).toEqual(mockUser);
      expect(userRepository.getById).toHaveBeenCalledWith('1');
    });

    it('should return null for non-existent user ID', async () => {
      (userRepository.getById as jest.Mock).mockResolvedValue(null);

      const result = await getUserById('999');

      expect(result).toBeNull();
      expect(userRepository.getById).toHaveBeenCalledWith('999');
    });

    it('should handle errors when fetching user by ID', async () => {
      (userRepository.getById as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getUserById('1');

      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      (jwt.sign as jest.Mock).mockReturnValue('generated_token');

      const token = generateToken(mockUser);

      expect(token).toBe('generated_token');
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          username: mockUser.username,
          name: mockUser.name,
        },
        'fallback-jwt-secret',
        { expiresIn: '7d' }
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid JWT token', () => {
      const decodedToken = {
        id: '1',
        username: 'johndoe',
        name: 'John Doe',
      };

      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      const result = verifyToken('valid_token');

      expect(result).toEqual(decodedToken);
      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'fallback-jwt-secret');
    });

    it('should return null for invalid JWT token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = verifyToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('createSession', () => {
    it('should create a session for valid credentials', async () => {
      // Mock successful authentication
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      (jwt.sign as jest.Mock).mockReturnValue('session_token');

      const result = await createSession('johndoe', 'password123');

      expect(result).toEqual({
        success: true,
        token: 'session_token',
      });
      expect(userRepository.getByUsername).toHaveBeenCalledWith('johndoe');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('should fail to create a session for invalid credentials', async () => {
      // Mock failed authentication
      (userRepository.getByUsername as jest.Mock).mockResolvedValue(null);

      const result = await createSession('invaliduser', 'wrongpassword');

      expect(result).toEqual({ success: false });
      expect(userRepository.getByUsername).toHaveBeenCalledWith('invaliduser');
    });
  });
});
