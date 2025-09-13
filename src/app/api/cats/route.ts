import { NextResponse } from 'next/server';
import { catRepository, type Cat } from '@/lib/data';
import { normalizeBreed } from '@/lib/utils';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';

/**
 * Simple database API for cats.
 * NOTE: This is persistent and stores data in PostgreSQL.
 * Debug logs included to verify mutations propagate.
 */

function validatePayload(body: any) {
  const errors: string[] = [];
  if (!body) {
    errors.push('Body boş');
    return errors;
  }
  if (typeof body.name !== 'string' || body.name.trim().length === 0) errors.push('Geçersiz name');
  if (typeof body.breed !== 'string' || body.breed.trim().length === 0) errors.push('Geçersiz breed');
  if (typeof body.age !== 'number' || body.age < 0) errors.push('Geçersiz age');
  if (body.gender !== 'Male' && body.gender !== 'Female') errors.push('Geçersiz gender');
  if (typeof body.description !== 'string' || body.description.trim().length === 0) errors.push('Geçersiz description');
  if (typeof body.image !== 'string' || body.image.trim().length === 0) errors.push('Geçersiz image');
  return errors;
}

// GET /api/cats  -> list all
export async function GET() {
  try {
    // Try to get from cache first
    const cachedCats = await cacheUtils.getCachedCats();
    if (cachedCats) {
      console.debug('[API][GET /api/cats] returning cached data', { count: cachedCats.length });
      return NextResponse.json({ success: true, data: cachedCats });
    }

    const cats = await catRepository.getAll();
    console.debug('[API][GET /api/cats] returning', { count: cats.length });

    // Cache the result
    await cacheUtils.setCachedCats(cats);

    return NextResponse.json({ success: true, data: cats });
  } catch (err) {
    console.error('[API][GET /api/cats] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// POST /api/cats -> create
export async function POST(request: NextRequest) {
  // Require authentication for creating cats
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);

    const errors = validatePayload(body);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const newCat: Omit<Cat, 'id'> = {
      name: body.name.trim(),
      breed: normalizeBreed(body.breed),
      age: body.age,
      gender: body.gender,
      description: body.description.trim(),
      image: body.image.trim(),
      dataAiHint: body.dataAiHint ? String(body.dataAiHint) : ''
    };

    const createdCat = await catRepository.create(newCat);
    console.debug('[API][POST /api/cats] created', { id: createdCat.id, total: (await catRepository.getAll()).length });

    // Invalidate cache after creating a new cat
    await cacheUtils.invalidateCatsCache();

    return NextResponse.json({ success: true, data: createdCat }, { status: 201 });
  } catch (err) {
    console.error('[API][POST /api/cats] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
