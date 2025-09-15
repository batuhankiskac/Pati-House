import { z } from 'zod';
import { validateData, formatErrors, getFieldError } from '@/lib/validation/utils';

// Test schema
const testSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(18, 'Must be at least 18 years old'),
  email: z.string().email('Invalid email format'),
});

describe('Validation Utilities', () => {
  describe('validateData', () => {
    it('should validate correct data', () => {
      const validData = {
        name: 'John Doe',
        age: 25,
        email: 'john.doe@example.com',
      };

      const result = validateData(testSchema, validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: '', // Empty name
        age: 15, // Too young
        email: 'invalid-email', // Invalid format
      };

      const result = validateData(testSchema, invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(3);

      // Check that all expected errors are present
      const errorMessages = result.errors!.map(error => error.message);
      expect(errorMessages).toContain('Name is required');
      expect(errorMessages).toContain('Must be at least 18 years old');
      expect(errorMessages).toContain('Invalid email format');
    });

    it('should handle unexpected errors gracefully', () => {
      // Create a schema that will throw an error during parsing
      const problematicSchema = z.object({
        name: z.string().refine(() => {
          throw new Error('Unexpected error');
        }),
      });

      const result = validateData(problematicSchema, { name: 'John' });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].message).toBe('An unexpected error occurred during validation');
    });
  });

  describe('formatErrors', () => {
    it('should format errors into a record', () => {
      const errors = [
        { path: 'name', message: 'Name is required' },
        { path: 'age', message: 'Must be at least 18 years old' },
        { path: 'email', message: 'Invalid email format' },
      ];

      const formatted = formatErrors(errors);

      expect(formatted).toEqual({
        name: 'Name is required',
        age: 'Must be at least 18 years old',
        email: 'Invalid email format',
      });
    });

    it('should handle empty errors array', () => {
      const formatted = formatErrors([]);
      expect(formatted).toEqual({});
    });
  });

  describe('getFieldError', () => {
    it('should return error message for a specific field', () => {
      const errors = [
        { path: 'name', message: 'Name is required' },
        { path: 'age', message: 'Must be at least 18 years old' },
      ];

      const nameError = getFieldError(errors, 'name');
      expect(nameError).toBe('Name is required');

      const ageError = getFieldError(errors, 'age');
      expect(ageError).toBe('Must be at least 18 years old');
    });

    it('should return undefined for non-existent field', () => {
      const errors = [
        { path: 'name', message: 'Name is required' },
      ];

      const emailError = getFieldError(errors, 'email');
      expect(emailError).toBeUndefined();
    });

    it('should return undefined for empty errors array', () => {
      const error = getFieldError([], 'name');
      expect(error).toBeUndefined();
    });
  });
});
