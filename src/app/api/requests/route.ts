import { NextResponse } from 'next/server';
import { adoptionRequestRepository, type AdoptionRequest } from '@/lib/data';
import { requireAuth } from '@/lib/auth-session';
import { NextRequest } from 'next/server';
import cacheUtils from '@/lib/cache/cache-utils';
import { ERROR_MESSAGES } from '@/lib/config';

export const runtime = 'nodejs';

/**
 * Database adoption requests collection endpoint.
 * GET /api/requests   -> list all
 * POST /api/requests  -> create new request
 * Persistent: stores data in PostgreSQL database.
 */

function validateCreate(body: unknown): string[] {
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

  if (typeof payload.catName !== 'string' || !payload.catName.trim()) errors.push('Invalid catName');
  if (typeof payload.fullName !== 'string' || !payload.fullName.trim()) errors.push('Invalid fullName');
  if (typeof payload.email !== 'string' || !payload.email.includes('@')) errors.push('Invalid email');
  if (typeof payload.phone !== 'string' || payload.phone.trim().length < 5) errors.push('Invalid phone');
  if (typeof payload.address !== 'string' || payload.address.trim().length < 5) errors.push('Invalid address');
  if (typeof payload.reason !== 'string' || payload.reason.trim().length < 10) errors.push('Invalid reason');
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
    // return NextResponse.json({ success: false, error: 'Beklenmeyen hata' }, { status: 500 });
    return NextResponse.json({ success: false, error: ERROR_MESSAGES.UNEXPECTED_ERROR }, { status: 500 });
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

    // Type assertion after validation
    const validatedBody = body as Record<string, unknown>;

    const newRequest: Omit<AdoptionRequest, 'id'> = {
      catName: (validatedBody.catName as string).trim(),
      requestDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      applicant: {
        name: (validatedBody.fullName as string).trim(),
        email: (validatedBody.email as string).trim(),
        phone: (validatedBody.phone as string).trim(),
        address: (validatedBody.address as string).trim(),
        reason: (validatedBody.reason as string).trim(),
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
