import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { warmUpAllCaches } from '@/lib/cache/cache-warming';

/**
 * API endpoint to manually trigger cache warming
 * POST /api/cache/warmup
 */

export async function POST(request: NextRequest) {
  // Require authentication for cache warming
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    console.log('[API][Cache Warmup] Starting manual cache warming...');
    await warmUpAllCaches();
    console.log('[API][Cache Warmup] Manual cache warming completed');

    return NextResponse.json({
      success: true,
      message: 'Cache warming completed successfully'
    });
  } catch (error) {
    console.error('[API][Cache Warmup] Error during manual cache warming:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache warming failed'
    }, { status: 500 });
  }
}
