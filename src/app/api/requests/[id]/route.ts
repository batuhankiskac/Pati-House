import { NextResponse } from 'next/server';
import { adoptionRequests } from '@/lib/data';

/**
 * Item-level adoption request endpoint.
 *  GET    /api/requests/:id      -> fetch single request
 *  PATCH  /api/requests/:id      -> update status or applicant fields
 *  DELETE /api/requests/:id      -> remove request (optional)
 * In-memory only (non-persistent).
 */

type Status = 'Bekliyor' | 'Onaylandı' | 'Reddedildi';

function findIndex(idNum: number) {
  return adoptionRequests.findIndex(r => r.id === idNum);
}

function sanitizePatch(body: any) {
  const allowedStatus: Status[] = ['Bekliyor', 'Onaylandı', 'Reddedildi'];
  if (!body || typeof body !== 'object') {
    return { patch: {}, allowedStatus };
  }
  const patch: any = {};

  if (body.status !== undefined) patch.status = body.status;
  if (body.applicant && typeof body.applicant === 'object') {
    patch.applicant = {};
    const a = body.applicant;
    if (a.name !== undefined) patch.applicant.name = a.name;
    if (a.email !== undefined) patch.applicant.email = a.email;
    if (a.phone !== undefined) patch.applicant.phone = a.phone;
    if (a.address !== undefined) patch.applicant.address = a.address;
    if (a.reason !== undefined) patch.applicant.reason = a.reason;
  }
  return { patch, allowedStatus };
}

function validatePatch(patch: any, allowedStatus: Status[]): string[] {
  const errors: string[] = [];
  if (patch.status !== undefined && !allowedStatus.includes(patch.status)) {
    errors.push('Geçersiz status');
  }
  if (patch.applicant) {
    const a = patch.applicant;
    if (a.email !== undefined && (typeof a.email !== 'string' || !a.email.includes('@'))) {
      errors.push('Geçersiz applicant.email');
    }
    if (a.name !== undefined && (typeof a.name !== 'string' || !a.name.trim())) {
      errors.push('Geçersiz applicant.name');
    }
  }
  return errors;
}

// GET /api/requests/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const item = adoptionRequests.find(r => r.id === idNum);
  if (!item) {
    return NextResponse.json({ success: false, error: 'Başvuru bulunamadı' }, { status: 404 });
  }
  console.debug('[API][GET /api/requests/:id]', { id: idNum });
  return NextResponse.json({ success: true, data: item });
}

// PATCH /api/requests/:id
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const idx = findIndex(idNum);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Başvuru bulunamadı' }, { status: 404 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const { patch, allowedStatus } = sanitizePatch(body);
    const errors = validatePatch(patch, allowedStatus);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    // Merge
    adoptionRequests[idx] = {
      ...adoptionRequests[idx],
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.applicant
        ? {
            applicant: {
              ...adoptionRequests[idx].applicant,
              ...patch.applicant,
            },
          }
        : {}),
    };

    console.debug('[API][PATCH /api/requests/:id] updated', {
      id: idNum,
      status: adoptionRequests[idx].status,
    });

    return NextResponse.json({ success: true, data: adoptionRequests[idx] });
  } catch (err) {
    console.error('[API][PATCH /api/requests/:id] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// DELETE /api/requests/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Geçersiz id' }, { status: 400 });
  }
  const idx = findIndex(idNum);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Başvuru bulunamadı' }, { status: 404 });
  }
  const removed = adoptionRequests[idx];
  adoptionRequests.splice(idx, 1);
  console.debug('[API][DELETE /api/requests/:id] removed', {
    id: idNum,
    remaining: adoptionRequests.length,
  });
  return NextResponse.json({ success: true, data: removed });
}
