import { z, ZodSchema } from 'zod';
import logger from '@/lib/logger';

// Type for validation errors
export type ValidationError = {
  path: string;
  message: string;
};

// Type for validation result
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
};

/**
 * Validates data against a Zod schema
 * @param schema The Zod schema to validate against
 * @param data The data to validate
 * @returns ValidationResult with success status, parsed data, and errors if any
 */
export function validateData<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const parsedData = schema.parse(data);
    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError || (error && typeof error === 'object' && Array.isArray((error as any).issues))) {
      const issues = error instanceof z.ZodError ? error.issues : (error as any).issues;
      const errors: ValidationError[] = issues.map((err: { path: (string | number)[]; message: string }) => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      // Log validation errors
      logger.error('Validation failed', {
        errors,
        data: typeof data === 'object' ? data : { value: data }
      });

      return {
        success: false,
        errors,
      };
    }

    // Handle unexpected errors
    logger.error('Unexpected validation error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      errors: [{ path: '', message: 'An unexpected error occurred during validation' }],
    };
  }
}

/**
 * Formats validation errors into a more user-friendly format
 * @param errors Array of validation errors
 * @returns Record with field names as keys and error messages as values
 */
export function formatErrors(errors: ValidationError[]): Record<string, string> {
  const formatted: Record<string, string> = {};

  errors.forEach((error) => {
    formatted[error.path] = error.message;
  });

  return formatted;
}

/**
 * Gets a single error message for a field
 * @param errors Array of validation errors
 * @param fieldPath The path of the field to get the error for
 * @returns Error message for the field or undefined if no error
 */
export function getFieldError(errors: ValidationError[], fieldPath: string): string | undefined {
  const error = errors.find((err) => err.path === fieldPath);
  return error?.message;
}
