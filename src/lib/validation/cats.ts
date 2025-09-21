import { z } from 'zod';

// Schema for cat creation/editing
export const catFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  breed: z.string().min(1, 'Breed is required').max(50, 'Breed must be 50 characters or less'),
  age: z.coerce.number().int().min(0, 'Age must be 0 or greater').max(30, 'Age must be 30 or less'),
  gender: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Gender must be Male or Female' }),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be 500 characters or less'),
  image: z.string().url('Image must be a valid URL'),
});

// Schema for partial cat updates
export const catUpdateSchema = catFormSchema.partial();

// Infer TypeScript types from schemas
export type CatFormData = z.infer<typeof catFormSchema>;
export type CatUpdateData = z.infer<typeof catUpdateSchema>;
