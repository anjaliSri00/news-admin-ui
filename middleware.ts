// middleware.ts
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

const EDITORIAL_ROLES = ['admin', 'operations', 'editor', 'author', 'superadmin'];

const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: SESSION_COOKIE,
  });

  // If already on the signin page, let it through — avoids
  // /admin/signin?callbackUrl=%2Fadmin%2Fsignin loops.
  if (pathname === '/admin/signin') {
    if (token) {
      // Already signed in → bounce to the dashboard
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    const signinUrl = new URL('/admin/signin', req.url);
    // Only set callbackUrl for real protected pages, never for signin itself
    if (pathname !== '/admin/signin') {
      signinUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(signinUrl);
  }

  const roles = (token.userTypes as string[]) ?? [];
  const isSuper = Boolean(token.isSuperadmin);
  const hasEditorial =
    isSuper || roles.some((r) => EDITORIAL_ROLES.includes(r));

  if (!hasEditorial) {
    return NextResponse.redirect(new URL('/admin/signin', req.url));
  }

  if (
    pathname.startsWith('/admin/users') ||
    pathname.startsWith('/admin/settings')
  ) {
    if (!isSuper && !roles.includes('admin') && !roles.includes('operations')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};