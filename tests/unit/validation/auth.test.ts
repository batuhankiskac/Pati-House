import { loginSchema, registerSchema } from '@/lib/validation/auth';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a correct login form', () => {
      const validLogin = {
        username: 'johndoe',
        password: 'admin',
      };

      expect(() => loginSchema.parse(validLogin)).not.toThrow();
    });

    it('should reject a login form with missing username', () => {
      const invalidLogin = {
        password: 'admin',
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });

    it('should reject a login form with username too long', () => {
      const invalidLogin = {
        username: 'a'.repeat(51), // 51 characters, max is 50
        password: 'admin',
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });

    it('should reject a login form with password too short', () => {
      const invalidLogin = {
        username: 'johndoe',
        password: 'pass', // Min is 5 characters
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });

    it('should reject a login form with password too long', () => {
      const invalidLogin = {
        username: 'johndoe',
        password: 'p'.repeat(101), // 101 characters, max is 100
      };

      expect(() => loginSchema.parse(invalidLogin)).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate a correct registration form', () => {
      const validRegister = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(validRegister)).not.toThrow();
    });

    it('should reject a registration form with username too short', () => {
      const invalidRegister = {
        username: 'jo', // Min is 3 characters
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with username too long', () => {
      const invalidRegister = {
        username: 'a'.repeat(31), // 31 characters, max is 30
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with invalid email', () => {
      const invalidRegister = {
        username: 'johndoe',
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with password too short', () => {
      const invalidRegister = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'pass', // Min is 8 characters
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with password too long', () => {
      const invalidRegister = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'p'.repeat(101), // 101 characters, max is 100
        name: 'John Doe',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with missing name', () => {
      const invalidRegister = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });

    it('should reject a registration form with name too long', () => {
      const invalidRegister = {
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'password123',
        name: 'a'.repeat(101), // 101 characters, max is 100
      };

      expect(() => registerSchema.parse(invalidRegister)).toThrow();
    });
  });
});
