'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/lib/auth';

/**
 * Legacy server action `submitAdoptionRequest` removed.
 * Adoption requests are now created via REST endpoint POST /api/requests
 * through the client hook useRequests().createRequest.
 */

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

  redirect('/admin');
}

export async function signOut() {
  await destroySession();
  redirect('/');
}
