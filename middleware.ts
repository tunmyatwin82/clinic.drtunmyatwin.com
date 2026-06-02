import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CLINIC_ROLE_COOKIE, getRoleFromCookieHeader } from '@/lib/auth-cookie';

const STAFF_ROLES = new Set(['doctor', 'admin']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = getRoleFromCookieHeader(request.cookies.get(CLINIC_ROLE_COOKIE)?.value ?? null);

  if (pathname.startsWith('/booking') && role && STAFF_ROLES.has(role)) {
    return NextResponse.redirect(new URL('/dashboard/appointments', request.url));
  }

  if (pathname.startsWith('/dashboard/patients')) {
    if (role === 'patient') {
      return NextResponse.redirect(new URL('/dashboard/appointments', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/booking/:path*', '/dashboard/patients/:path*'],
};
