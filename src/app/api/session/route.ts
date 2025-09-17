import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/auth-session';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: session.user,
  });
}

export async function DELETE() {
  await destroySession();
  logger.debug('Session destroyed via API');
  return NextResponse.json({ success: true });
}
