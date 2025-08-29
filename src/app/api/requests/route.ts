import { NextResponse } from 'next/server';
import { adoptionRequests, type AdoptionRequest } from '@/lib/data';

/**
 * In-memory adoption requests collection endpoint.
 * GET /api/requests   -> list all
 * POST /api/requests  -> create new request
 * Non-persistent: resets on server restart / redeploy.
 */

function validateCreate(body: any): string[] {
  const errors: string[] = [];
  if (!body) {
    errors.push('Body boş');
    return errors;
  }
  if (typeof body.catName !== 'string' || !body.catName.trim()) errors.push('Geçersiz catName');
  if (typeof body.fullName !== 'string' || !body.fullName.trim()) errors.push('Geçersiz fullName');
  if (typeof body.email !== 'string' || !body.email.includes('@')) errors.push('Geçersiz email');
  if (typeof body.phone !== 'string' || body.phone.trim().length < 5) errors.push('Geçersiz phone');
  if (typeof body.address !== 'string' || body.address.trim().length < 5) errors.push('Geçersiz address');
  if (typeof body.reason !== 'string' || body.reason.trim().length < 10) errors.push('Geçersiz reason');
  return errors;
}

// GET /api/requests
export async function GET() {
  try {
    console.debug('[API][GET /api/requests] returning', { count: adoptionRequests.length });
    return NextResponse.json({ success: true, data: adoptionRequests });
  } catch (err) {
    console.error('[API][GET /api/requests] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// POST /api/requests
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const errors = validateCreate(body);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const nextId = adoptionRequests.length
      ? Math.max(...adoptionRequests.map(r => r.id)) + 1
      : 1;

    const newRequest: AdoptionRequest = {
      id: nextId,
      catName: body.catName.trim(),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Bekliyor',
      applicant: {
        name: body.fullName.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        reason: body.reason.trim(),
      },
    };

    adoptionRequests.push(newRequest);
    console.debug('[API][POST /api/requests] created', { id: newRequest.id, total: adoptionRequests.length });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (err) {
    console.error('[API][POST /api/requests] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
