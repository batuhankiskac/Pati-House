import { NextResponse } from 'next/server';
import { adoptionRequestRepository } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';

/**
 * Item-level adoption request endpoint.
 *  GET    /api/requests/:id      -> fetch single request
 *  PATCH  /api/requests/:id      -> update status or applicant fields
 *  DELETE /api/requests/:id      -> remove request (optional)
 * Persistent database storage.
 */

type Status = 'Pending' | 'Approved' | 'Rejected';

function sanitizePatch(body: any) {
  const allowedStatus: Status[] = ['Pending', 'Approved', 'Rejected'];
  if (!body || typeof body !== 'object') {
    return { patch: {}, allowedStatus };
  }
  const patch: any = {};

  if (body.status !== undefined) {
    patch.status = body.status;
  }

  if (body.applicant && typeof body.applicant === 'object') {
    const a = body.applicant;
    const cleaned: any = {};
    const assignIf = (key: string, val: any, opts?: { lower?: boolean }) => {
      if (val !== undefined) {
        if (typeof val === 'string') {
          let v = val.trim().replace(/\s+/g, ' ');
          if (opts?.lower) v = v.toLowerCase();
          cleaned[key] = v;
        } else {
          cleaned[key] = val;
        }
      }
    };
    assignIf('name', a.name);
    assignIf('email', a.email, { lower: true });
    assignIf('phone', a.phone);
    assignIf('address', a.address);
    assignIf('reason', a.reason);
    if (Object.keys(cleaned).length) {
      patch.applicant = cleaned;
    }
  }

  return { patch, allowedStatus };
}

function validatePatch(patch: any, allowedStatus: Status[]): string[] {
  const errors: string[] = [];
  if (patch.status !== undefined && !allowedStatus.includes(patch.status)) {
    errors.push('Invalid status');
  }
  if (patch.applicant) {
    const a = patch.applicant;
    if (a.email !== undefined && (typeof a.email !== 'string' || !a.email.includes('@'))) {
      errors.push('Invalid applicant.email');
    }
    if (a.name !== undefined && (typeof a.name !== 'string' || !a.name.trim())) {
      errors.push('Invalid applicant.name');
    }
  }
  return errors;
}

// GET /api/requests/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Require authentication for viewing requests
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  // Try to get from cache first
  const cachedRequest = await cacheUtils.getCachedRequest(idNum);
  if (cachedRequest) {
    console.debug('[API][GET /api/requests/:id] returning cached data', { id: idNum });
    return NextResponse.json({ success: true, data: cachedRequest });
  }

  const item = await adoptionRequestRepository.getById(idNum);
  if (!item) {
    return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
  }

  // Cache the result
  await cacheUtils.setCachedRequest(idNum, item);

  console.debug('[API][GET /api/requests/:id]', { id: idNum });
  return NextResponse.json({ success: true, data: item });
}

// PATCH /api/requests/:id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  // Require authentication for updating requests
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const existingRequest = await adoptionRequestRepository.getById(idNum);
  if (!existingRequest) {
    return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { patch, allowedStatus } = sanitizePatch(body);
    const errors = validatePatch(patch, allowedStatus);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const updatedRequest = await adoptionRequestRepository.update(idNum, patch);
    if (!updatedRequest) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    // Invalidate cache after updating a request
    await cacheUtils.invalidateRequestCache(idNum);
    await cacheUtils.invalidateRequestsCache();

    console.debug('[API][PATCH /api/requests/:id] updated', {
      id: idNum,
      status: updatedRequest.status,
    });

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (err) {
    console.error('[API][PATCH /api/requests/:id] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// DELETE /api/requests/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Require authentication for deleting requests
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  const idNum = Number(params.id);
  if (Number.isNaN(idNum)) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  const existingRequest = await adoptionRequestRepository.getById(idNum);
 if (!existingRequest) {
    return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
  }

  try {
    const success = await adoptionRequestRepository.delete(idNum);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    // Invalidate cache after deleting a request
    await cacheUtils.invalidateRequestCache(idNum);
    await cacheUtils.invalidateRequestsCache();

    console.debug('[API][DELETE /api/requests/:id] removed', {
      id: idNum,
    });
    return NextResponse.json({ success: true, data: existingRequest });
  } catch (err) {
    console.error('[API][DELETE /api/requests/:id] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
