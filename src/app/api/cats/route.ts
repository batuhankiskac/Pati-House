import { NextResponse } from 'next/server';
import { catRepository, type Cat } from '@/lib/data';
import { normalizeBreed } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-session';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';
import { ERROR_MESSAGES } from '@/lib/config';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

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
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Try to get from cache first
    const cachedCats = await cacheUtils.getCachedCats();
    if (cachedCats) {
      const duration = Date.now() - startTime;
      logger.http('GET', '/api/cats', 200, duration, {
        cached: true,
        count: cachedCats.length
      });
      return NextResponse.json({ success: true, data: cachedCats });
    }

    const cats = await catRepository.getAll();
    const duration = Date.now() - startTime;
    logger.http('GET', '/api/cats', 200, duration, {
      cached: false,
      count: cats.length
    });

    // Cache the result
    await cacheUtils.setCachedCats(cats);

    return NextResponse.json({ success: true, data: cats });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('[API][GET /api/cats] error', {
      error: err instanceof Error ? err.message : 'Unknown error',
      duration
    });
    // return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
    return NextResponse.json({ success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR }, { status: 500 });
  }
}

// POST /api/cats -> create
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  // Require authentication for creating cats
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    const duration = Date.now() - startTime;
    logger.http('POST', '/api/cats', 401, duration, {
      message: 'Unauthorized access'
    });
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);

    const errors = validatePayload(body);
    if (errors.length) {
      const duration = Date.now() - startTime;
      logger.http('POST', '/api/cats', 400, duration, {
        message: 'Validation failed',
        errors
      });
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
    const totalCats = await catRepository.getAll();
    const duration = Date.now() - startTime;
    logger.http('POST', '/api/cats', 201, duration, {
      id: createdCat.id,
      total: totalCats.length
    });

    // Invalidate cache after creating a new cat
    await cacheUtils.invalidateCatsCache();

    return NextResponse.json({ success: true, data: createdCat }, { status: 201 });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('[API][POST /api/cats] error', {
      error: err instanceof Error ? err.message : 'Unknown error',
      duration
    });
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
