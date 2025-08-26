import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Admin sayfalarını koru
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth-token');

    // Debug için header ekle
    response.headers.set('x-middleware-debug', 'admin-page-detected');

    if (!authToken || authToken.value !== 'authenticated') {
      // Debug için header ekle
      response.headers.set('x-middleware-redirect', 'to-login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Debug için header ekle
    response.headers.set('x-middleware-auth', 'passed');
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
