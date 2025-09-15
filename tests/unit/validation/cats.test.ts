import { catFormSchema, catUpdateSchema } from '@/lib/validation/cats';

describe('Cat Validation Schemas', () => {
  describe('catFormSchema', () => {
    it('should validate a correct cat form', () => {
      const validCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: 3,
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(validCat)).not.toThrow();
    });

    it('should reject a cat form with missing name', () => {
      const invalidCat = {
        breed: 'Persian',
        age: 3,
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with name too long', () => {
      const invalidCat = {
        name: 'A'.repeat(51), // 51 characters, max is 50
        breed: 'Persian',
        age: 3,
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with negative age', () => {
      const invalidCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: -1,
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with age over 30', () => {
      const invalidCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: 31, // Max is 30
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with invalid gender', () => {
      const invalidCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: 3,
        gender: 'Other' as any,
        description: 'A fluffy Persian cat who loves to play',
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with description too short', () => {
      const invalidCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: 3,
        gender: 'Male' as const,
        description: 'Short', // Min is 10 characters
        image: 'https://example.com/cat.jpg',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });

    it('should reject a cat form with invalid image URL', () => {
      const invalidCat = {
        name: 'Fluffy',
        breed: 'Persian',
        age: 3,
        gender: 'Male' as const,
        description: 'A fluffy Persian cat who loves to play',
        image: 'not-a-url',
      };

      expect(() => catFormSchema.parse(invalidCat)).toThrow();
    });
  });

  describe('catUpdateSchema', () => {
    it('should validate a partial cat update', () => {
      const validUpdate = {
        name: 'Fluffy Updated',
      };

      expect(() => catUpdateSchema.parse(validUpdate)).not.toThrow();
    });

    it('should allow empty object for cat update', () => {
      const validUpdate = {};

      expect(() => catUpdateSchema.parse(validUpdate)).not.toThrow();
    });

    it('should reject invalid fields in cat update', () => {
      const invalidUpdate = {
        invalidField: 'value',
      };

      // Partial schema should strip unknown fields without throwing
      const result = catUpdateSchema.parse(invalidUpdate);
      expect(result).toEqual({});
    });
  });
});
