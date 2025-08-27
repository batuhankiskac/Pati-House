'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/lib/auth';
import { adoptionRequests, type AdoptionRequest } from '@/lib/data';

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

export async function submitAdoptionRequest(data: {
  catName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  reason: string;
}) {
  try {
    const newId = Math.max(...adoptionRequests.map(req => req.id)) + 1;
    const newRequest: AdoptionRequest = {
      id: newId,
      catName: data.catName,
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Bekliyor',
      applicant: {
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        reason: data.reason,
      }
    };

    adoptionRequests.push(newRequest);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Başvuru gönderilirken hata oluştu' };
  }
}
