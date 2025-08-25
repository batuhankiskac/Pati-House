'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      // Sadece 'CredentialsSignin' hatasını yakala, diğer tüm hatalar (yönlendirme dahil) yeniden fırlatılsın.
      if (error.type === 'CredentialsSignin') {
        return 'CredentialsSignin';
      }
      // Diğer AuthError türlerini yeniden fırlat.
      throw error;
    }
    // AuthError olmayan diğer hataları yeniden fırlat.
    throw error;
  }
}
