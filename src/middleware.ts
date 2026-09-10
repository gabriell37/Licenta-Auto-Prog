import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/pro', '/admin', '/garage', '/appointments', '/account', '/book'];
const COOKIE = 'autoprog_session';

/**
 * Lightweight edge guard: bounce unauthenticated users away from protected
 * sections to /login (preserving the return path). Full authorization (roles,
 * tenant membership) is still enforced server-side in each page/action.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const hasSession = req.cookies.has(COOKIE);
  if (hasSession) return NextResponse.next();

  // Build the redirect against the PUBLIC host so it works behind a reverse proxy
  // (otherwise NextResponse.redirect would use the internal proxy target host).
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host;
  const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
  const url = new URL(`${proto}://${host}/login`);
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/pro/:path*', '/admin/:path*', '/garage/:path*', '/appointments/:path*', '/account/:path*', '/book/:path*'],
};
