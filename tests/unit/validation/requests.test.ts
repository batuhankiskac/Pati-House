import { adoptionRequestSchema, adoptionRequestStatusSchema } from '@/lib/validation/requests';

describe('Adoption Request Validation Schemas', () => {
  describe('adoptionRequestSchema', () => {
    it('should validate a correct adoption request form', () => {
      const validRequest = {
        catName: 'Fluffy',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should reject an adoption request with missing cat name', () => {
      const invalidRequest = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject an adoption request with name too short', () => {
      const invalidRequest = {
        catName: 'Fluffy',
        fullName: 'Jo', // Min is 2 characters
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject an adoption request with invalid email', () => {
      const invalidRequest = {
        catName: 'Fluffy',
        fullName: 'John Doe',
        email: 'invalid-email',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject an adoption request with phone number too short', () => {
      const invalidRequest = {
        catName: 'Fluffy',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123', // Min is 10 digits
        address: '123 Main St, City, Country',
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject an adoption request with address too short', () => {
      const invalidRequest = {
        catName: 'Fluffy',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: 'Short', // Min is 10 characters
        reason: 'I love cats and want to provide a loving home for Fluffy.',
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });

    it('should reject an adoption request with reason too short', () => {
      const invalidRequest = {
        catName: 'Fluffy',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        address: '123 Main St, City, Country',
        reason: 'Too short', // Min is 20 characters
      };

      expect(() => adoptionRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('adoptionRequestStatusSchema', () => {
    it('should validate a correct status update', () => {
      const validStatus = {
        status: 'Approved' as const,
      };

      expect(() => adoptionRequestStatusSchema.parse(validStatus)).not.toThrow();
    });

    it('should reject an invalid status', () => {
      const invalidStatus = {
        status: 'Invalid' as any,
      };

      expect(() => adoptionRequestStatusSchema.parse(invalidStatus)).toThrow();
    });

    it('should allow Pending status', () => {
      const validStatus = {
        status: 'Pending' as const,
      };

      expect(() => adoptionRequestStatusSchema.parse(validStatus)).not.toThrow();
    });

    it('should allow Rejected status', () => {
      const validStatus = {
        status: 'Rejected' as const,
      };

      expect(() => adoptionRequestStatusSchema.parse(validStatus)).not.toThrow();
    });
  });
});
