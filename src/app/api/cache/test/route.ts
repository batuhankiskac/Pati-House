import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-session';
import testCacheFunctionality from '@/lib/cache/test-cache';

export const runtime = 'nodejs';

/**
 * API endpoint to test cache functionality
 * POST /api/cache/test
 */

export async function POST(request: NextRequest) {
  // Require authentication for cache testing
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    console.log('[API][Cache Test] Starting cache functionality test...');
    await testCacheFunctionality();
    console.log('[API][Cache Test] Cache functionality test completed');

    return NextResponse.json({
      success: true,
      message: 'Cache functionality test completed successfully'
    });
  } catch (error) {
    console.error('[API][Cache Test] Error during cache functionality test:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache functionality test failed'
    }, { status: 500 });
  }
}
