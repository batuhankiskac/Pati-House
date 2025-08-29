import { NextResponse } from 'next/server';
import { cats, type Cat } from '@/lib/data';

/**
 * Simple in-memory API for cats.
 * NOTE: This is non-persistent and resets on server restart.
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
    console.debug('[API][GET /api/cats] returning', { count: cats.length });
    return NextResponse.json({ success: true, data: cats });
  } catch (err) {
    console.error('[API][GET /api/cats] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// POST /api/cats  -> create
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    const errors = validatePayload(body);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const nextId = cats.length ? Math.max(...cats.map(c => c.id)) + 1 : 1;

    const newCat: Cat = {
      id: nextId,
      name: body.name.trim(),
      breed: body.breed.trim(),
      age: body.age,
      gender: body.gender,
      description: body.description.trim(),
      image: body.image.trim(),
      dataAiHint: body.dataAiHint ? String(body.dataAiHint) : ''
    };

    cats.push(newCat);
    console.debug('[API][POST /api/cats] created', { id: newCat.id, total: cats.length });

    return NextResponse.json({ success: true, data: newCat }, { status: 201 });
  } catch (err) {
    console.error('[API][POST /api/cats] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
