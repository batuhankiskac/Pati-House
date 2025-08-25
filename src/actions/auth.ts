'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'CredentialsSignin';
        default:
          // Diğer tüm AuthError hatalarını yeniden fırlat (yönlendirme dahil)
          throw error;
      }
    }
    // AuthError olmayan diğer tüm hataları yeniden fırlat
    throw error;
  }
}
