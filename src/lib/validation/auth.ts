import { z } from 'zod';

// Schema for login forms
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username must be 50 characters or less'),
  password: z
    .string()
    .min(5, 'Password must be at least 5 characters')
    .max(100, 'Password must be 100 characters or less'),
});

// Schema for user registration (if needed in the future)
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be 30 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be 100 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
});

// Infer TypeScript types from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
