'use server';

import { adoptionRequests, cats, type Cat } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function updateRequestStatus(requestId: number, status: 'Onaylandı' | 'Reddedildi' | 'Bekliyor') {
  try {
    const requestIndex = adoptionRequests.findIndex(req => req.id === requestId);
    if (requestIndex !== -1) {
      adoptionRequests[requestIndex].status = status;
      revalidatePath('/admin/requests');
      return { success: true };
    }
    return { success: false, error: 'Başvuru bulunamadı' };
  } catch (error) {
    return { success: false, error: 'Durum güncellenirken hata oluştu' };
  }
}

export async function deleteCat(catId: number) {
  try {
    const catIndex = cats.findIndex(cat => cat.id === catId);
    if (catIndex !== -1) {
      cats.splice(catIndex, 1);
      revalidatePath('/admin/cats');
      return { success: true };
    }
    return { success: false, error: 'Kedi bulunamadı' };
  } catch (error) {
    return { success: false, error: 'Kedi silinirken hata oluştu' };
  }
}

export async function updateCat(catId: number, catData: Partial<{
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  description: string;
}>) {
  try {
    const catIndex = cats.findIndex(cat => cat.id === catId);
    if (catIndex !== -1) {
      cats[catIndex] = { ...cats[catIndex], ...catData };
      revalidatePath('/admin/cats');
      return { success: true };
    }
    return { success: false, error: 'Kedi bulunamadı' };
  } catch (error) {
    return { success: false, error: 'Kedi güncellenirken hata oluştu' };
  }
}

export async function addCat(catData: {
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  dataAiHint: string;
}) {
  try {
    const newId = Math.max(...cats.map(cat => cat.id)) + 1;
    const newCat: Cat = {
      id: newId,
      ...catData
    };

    cats.push(newCat);
    revalidatePath('/admin/cats');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Kedi eklenirken hata oluştu' };
  }
}
