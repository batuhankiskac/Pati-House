import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware'i geçici olarak devre dışı bırak
  // Client-side auth context kullanıyoruz
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
