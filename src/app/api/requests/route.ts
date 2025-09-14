import { NextResponse } from 'next/server';
import { adoptionRequestRepository, type AdoptionRequest } from '@/lib/data';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';

/**
 * Database adoption requests collection endpoint.
 * GET /api/requests   -> list all
 * POST /api/requests  -> create new request
 * Persistent: stores data in PostgreSQL database.
 */

function validateCreate(body: any): string[] {
  const errors: string[] = [];
  if (!body) {
    errors.push('Body is empty');
    return errors;
  }
  if (typeof body.catName !== 'string' || !body.catName.trim()) errors.push('Invalid catName');
  if (typeof body.fullName !== 'string' || !body.fullName.trim()) errors.push('Invalid fullName');
  if (typeof body.email !== 'string' || !body.email.includes('@')) errors.push('Invalid email');
  if (typeof body.phone !== 'string' || body.phone.trim().length < 5) errors.push('Invalid phone');
  if (typeof body.address !== 'string' || body.address.trim().length < 5) errors.push('Invalid address');
  if (typeof body.reason !== 'string' || body.reason.trim().length < 10) errors.push('Invalid reason');
  return errors;
}

// GET /api/requests
export async function GET(request: NextRequest) {
  // Require authentication for viewing requests
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    // Try to get from cache first
    const cachedRequests = await cacheUtils.getCachedRequests();
    if (cachedRequests) {
      console.debug('[API][GET /api/requests] returning cached data', { count: cachedRequests.length });
      return NextResponse.json({ success: true, data: cachedRequests });
    }

    const requests = await adoptionRequestRepository.getAll();
    console.debug('[API][GET /api/requests] returning', { count: requests.length });

    // Cache the result
    await cacheUtils.setCachedRequests(requests);

    return NextResponse.json({ success: true, data: requests });
  } catch (err) {
    console.error('[API][GET /api/requests] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}

// POST /api/requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const errors = validateCreate(body);
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join(', ') }, { status: 400 });
    }

    const newRequest: Omit<AdoptionRequest, 'id'> = {
      catName: body.catName.trim(),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      applicant: {
        name: body.fullName.trim(),
        email: body.email.trim(),
        phone: body.phone.trim(),
        address: body.address.trim(),
        reason: body.reason.trim(),
      },
    };

    const createdRequest = await adoptionRequestRepository.create(newRequest);
    console.debug('[API][POST /api/requests] created', { id: createdRequest.id, total: (await adoptionRequestRepository.getAll()).length });

    // Invalidate cache after creating a new request
    await cacheUtils.invalidateRequestsCache();

    return NextResponse.json({ success: true, data: createdRequest }, { status: 201 });
  } catch (err) {
    console.error('[API][POST /api/requests] error', err);
    return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
  }
}
