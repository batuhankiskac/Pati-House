import { NextResponse } from 'next/server';
import { cats, type Cat } from '@/lib/data';

/**
 * Item-level API for a single cat.
 * Supports:
 *  GET /api/cats/:id
 *  PATCH /api/cats/:id
 *  DELETE /api/cats/:id
 * In-memory only (non-persistent).
 */

function findCatIndex(idNum: number) {
  return cats.findIndex(c => c.id === idNum);
}

function sanitizePatch(body: any): Partial<Cat> {
  const allowed: (keyof Cat)[] = ['name', 'breed', 'age', 'gender', 'description', 'image', 'dataAiHint'];
  const result: Partial<Cat> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      (result as any)[key] = body[key];
    }
  }
  return result;
}

function validatePatch(patch: Partial<Cat>) {
  const errors: string[] = [];
  if (patch.name !== undefined && (typeof patch.name !== 'string' || !patch.name.trim())) errors.push('Geçersiz name');
  if (patch.breed !== undefined && (typeof patch.breed !== 'string' || !patch.breed.trim())) errors.push('Geçersiz breed');
  if (patch.age !== undefined && (typeof patch.age !== 'number' || patch.age < 0)) errors.push('Geçersiz age');
  if (patch.gender !== undefined && patch.gender !== 'Male' && patch.gender !== 'Female') errors.push('Geçersiz gender');
  if (patch.description !== undefined && (typeof patch.description !== 'string' || !patch.description.trim())) errors.push('Geçersiz description');
  if (patch.image !== undefined && (typeof patch.image !== 'string' || !patch.image.trim())) errors.push('Geçersiz image');
  return errors;
}

// GET /api/cats/:id
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const cat = cats.find(c => c.id === idNum);
  if (!cat) {
    return NextResponse.json({ success: false, error: 'Kedi bulunamadı' }, { status: 404 });
  }
  console.debug('[API][GET /api/cats/:id] found', { id: idNum });
  return NextResponse.json({ success: true, data: cat });
}

// PATCH /api/cats/:id
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const idx = findCatIndex(idNum);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Kedi bulunamadı' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const patch = sanitizePatch(body);
    const errors = validatePatch(patch);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    cats[idx] = { ...cats[idx], ...patch };
    console.debug('[API][PATCH /api/cats/:id] updated', { id: idNum });
    return NextResponse.json({ success: true, data: cats[idx] });
  } catch (err) {
    console.error('[API][PATCH /api/cats/:id] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// DELETE /api/cats/:id
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const idx = findCatIndex(idNum);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Kedi bulunamadı' }, { status: 404 });
  }
  const removed = cats[idx];
  cats.splice(idx, 1);
  console.debug('[API][DELETE /api/cats/:id] removed', { id: idNum, remaining: cats.length });
  return NextResponse.json({ success: true, data: removed });
}
