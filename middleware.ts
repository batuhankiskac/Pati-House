import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Admin sayfalarını koru
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth-token');

    if (!authToken || authToken.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Diğer tüm istekler için devam et
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
