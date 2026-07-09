import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session_token');

  // Protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      // Redirect to login if no session cookie is found
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect /super-admin and its sub-routes
  if (request.nextUrl.pathname.startsWith('/super-admin')) {
    // Exclude the login page itself
    if (!request.nextUrl.pathname.startsWith('/super-admin/login')) {
      const adminCookie = request.cookies.get('super_admin_session_token');
      if (!adminCookie) {
        return NextResponse.redirect(new URL('/super-admin/login', request.url));
      }
    } else {
      // If already logged in, redirect away from super-admin login to super-admin dashboard
      const adminCookie = request.cookies.get('super_admin_session_token');
      if (adminCookie) {
        return NextResponse.redirect(new URL('/super-admin', request.url));
      }
    }
  }

  // Redirect authenticated regular users away from login/register
  if (sessionCookie && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/super-admin/:path*'],
};

