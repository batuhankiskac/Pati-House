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

function validatePayload(body: unknown): string[] {
  const errors: string[] = [];
  if (!body) {
    errors.push('Body is empty');
    return errors;
  }

  // Type guard to ensure body is an object
  if (typeof body !== 'object' || body === null) {
    errors.push('Body must be an object');
    return errors;
  }

  // Type assertion after validation
  const payload = body as Record<string, unknown>;

  if (typeof payload.name !== 'string' || payload.name.trim().length === 0) errors.push('Invalid name');
  if (typeof payload.breed !== 'string' || payload.breed.trim().length === 0) errors.push('Invalid breed');
  if (typeof payload.age !== 'number' || payload.age < 0) errors.push('Invalid age');
  if (payload.gender !== 'Male' && payload.gender !== 'Female') errors.push('Invalid gender');
  if (typeof payload.description !== 'string' || payload.description.trim().length === 0) errors.push('Invalid description');
  if (typeof payload.image !== 'string' || payload.image.trim().length === 0) errors.push('Invalid image');
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
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);

    const errors = validatePayload(body);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    // Type assertion after validation
    const validatedBody = body as Record<string, unknown>;

    const newCat: Omit<Cat, 'id'> = {
      name: (validatedBody.name as string).trim(),
      breed: normalizeBreed(validatedBody.breed as string),
      age: validatedBody.age as number,
      gender: validatedBody.gender as 'Male' | 'Female',
      description: (validatedBody.description as string).trim(),
      image: (validatedBody.image as string).trim(),
      dataAiHint: validatedBody.dataAiHint ? String(validatedBody.dataAiHint) : ''
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
