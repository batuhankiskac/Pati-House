import {auth} from '@/auth';
import {NextResponse} from 'next/server';

export default auth(req => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/admin')) {
    const newUrl = new URL('/login', req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/admin/:path*'],
};
