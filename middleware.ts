import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/token';
import { AUTH_CONFIG } from '@/lib/config';

// Cookie configuration
// const COOKIE_NAME = 'auth-token';
const COOKIE_NAME = AUTH_CONFIG.COOKIE_NAME;
const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/' as const
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/cats', '/cats/', '/adopt', '/adopt/', '/api/login'];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For admin paths, check authentication
  if (pathname.startsWith('/admin')) {
    // Get the auth token from cookies
    const authToken = request.cookies.get(COOKIE_NAME);

    // If no token, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify the token
    const decoded = await verifyToken(authToken.value);
    if (!decoded) {
      // If token is invalid, delete the cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set(COOKIE_NAME, '', {
        ...SECURE_COOKIE_OPTIONS,
        maxAge: 0,
        expires: new Date(0)
      });
      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // For all other paths, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
