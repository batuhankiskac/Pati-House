import { z } from 'zod';

// Schema for adoption request forms
export const adoptionRequestSchema = z.object({
  catName: z.string().min(1, 'Cat name is required'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be 100 characters or less'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number must be 20 digits or less'),
  address: z.string().min(10, 'Address must be at least 10 characters').max(200, 'Address must be 200 characters or less'),
  reason: z.string().min(20, 'Please provide more information (at least 20 characters)').max(500, 'Reason must be 500 characters or less'),
});

// Schema for adoption request status updates
export const adoptionRequestStatusSchema = z.object({
  status: z.enum(['Pending', 'Approved', 'Rejected'], {
    errorMap: () => ({ message: 'Status must be Pending, Approved, or Rejected' }),
  }),
});

// Infer TypeScript types from schemas
export type AdoptionRequestFormData = z.infer<typeof adoptionRequestSchema>;
export type AdoptionRequestStatusData = z.infer<typeof adoptionRequestStatusSchema>;
