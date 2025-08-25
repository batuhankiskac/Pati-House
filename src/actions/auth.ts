'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError && error.type === 'CredentialsSignin') {
      return 'CredentialsSignin';
    }
    // Başarılı girişten sonra signIn bir yönlendirme hatası fırlatır,
    // bu hatanın yeniden fırlatılması gerekir.
    throw error;
  }
}
