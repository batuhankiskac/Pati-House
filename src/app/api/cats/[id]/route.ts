import { NextResponse } from 'next/server';
import { catRepository, type Cat } from '@/lib/data';
import { normalizeBreed } from '@/lib/utils';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';
import { ERROR_MESSAGES } from '@/lib/config';

/**
 * Item-level API for a single cat.
 * Supports:
 *  GET /api/cats/:id
 *  PATCH /api/cats/:id
 *  DELETE /api/cats/:id
 * Persistent database storage.
 */

function sanitizePatch(body: unknown): Partial<Cat> {
  if (!body || typeof body !== 'object') return {};
  const allowed: (keyof Cat)[] = ['name', 'breed', 'age', 'gender', 'description', 'image', 'dataAiHint'];
  const result: Partial<Cat> = {};
  for (const key of allowed) {
    if ((body as Record<string, unknown>)[key] !== undefined) {
      let val = (body as Record<string, unknown>)[key];
      if (typeof val === 'string') {
        val = val.trim();
      }
      if (key === 'breed' && typeof val === 'string') {
        val = normalizeBreed(val);
      }
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

function validatePatch(patch: Partial<Cat>): string[] {
  const errors: string[] = [];
  if (patch.name !== undefined && (typeof patch.name !== 'string' || !patch.name)) errors.push('Invalid name');
  if (patch.breed !== undefined && (typeof patch.breed !== 'string' || !patch.breed)) errors.push('Invalid breed');
  if (patch.age !== undefined && (typeof patch.age !== 'number' || patch.age < 0)) errors.push('Invalid age');
  if (patch.gender !== undefined && patch.gender !== 'Male' && patch.gender !== 'Female') errors.push('Invalid gender');
  if (patch.description !== undefined && (typeof patch.description !== 'string' || !patch.description)) errors.push('Invalid description');
  if (patch.image !== undefined && (typeof patch.image !== 'string' || !patch.image)) errors.push('Invalid image');
  return errors;
}

// GET /api/cats/:id
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  // Try to get from cache first
  const cachedCat = await cacheUtils.getCachedCat(idNum);
  if (cachedCat) {
    console.debug('[API][GET /api/cats/:id] returning cached data', { id: idNum });
    return NextResponse.json({ success: true, data: cachedCat });
  }

  const cat = await catRepository.getById(idNum);
  if (!cat) {
    return NextResponse.json({ success: false, error: 'Cat not found' }, { status: 404 });
  }

  // Cache the result
  await cacheUtils.setCachedCat(idNum, cat);

  console.debug('[API][GET /api/cats/:id] found', { id: idNum });
  return NextResponse.json({ success: true, data: cat });
}

// PATCH /api/cats/:id
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Require authentication for updating cats
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const existingCat = await catRepository.getById(idNum);
  if (!existingCat) {
    return NextResponse.json({ success: false, error: 'Cat not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const patch = sanitizePatch(body);
    const errors = validatePatch(patch);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const updatedCat = await catRepository.update(idNum, patch);
    if (!updatedCat) {
      return NextResponse.json({ success: false, error: 'Cat not found' }, { status: 404 });
    }

    // Invalidate cache after updating a cat
    await cacheUtils.invalidateCatCache(idNum);
    await cacheUtils.invalidateCatsCache();

    console.debug('[API][PATCH /api/cats/:id] updated', { id: idNum });
    return NextResponse.json({ success: true, data: updatedCat });
  } catch (err) {
    console.error('[API][PATCH /api/cats/:id] error', err);
    // return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
    return NextResponse.json({ success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR }, { status: 500 });
  }
}

// DELETE /api/cats/:id
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // Require authentication for deleting cats
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const existingCat = await catRepository.getById(idNum);
  if (!existingCat) {
    return NextResponse.json({ success: false, error: 'Cat not found' }, { status: 404 });
  }

  try {
    const success = await catRepository.delete(idNum);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Cat not found' }, { status: 404 });
    }

    // Invalidate cache after deleting a cat
    await cacheUtils.invalidateCatCache(idNum);
    await cacheUtils.invalidateCatsCache();

    console.debug('[API][DELETE /api/cats/:id] removed', { id: idNum });
    return NextResponse.json({ success: true, data: existingCat });
  } catch (err) {
    console.error('[API][DELETE /api/cats/:id] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
