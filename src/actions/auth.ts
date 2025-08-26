'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/lib/auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const password = formData.get('password') as string;

    if (!password) {
      return 'Şifre gerekli';
    }

    const success = await createSession(password);

    if (!success) {
      return 'Geçersiz şifre';
    }

  } catch (error) {
    return 'Bir hata oluştu';
  }

  // Başarılı giriş - redirect'i try-catch dışında yap
  redirect('/admin');
}

export async function signOut() {
  await destroySession();
  redirect('/');
}
