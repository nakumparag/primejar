import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/users',
  '/jobs',
  '/groups',
  // '/admin', // Temporarily disabled admin auth guard
  '/dashboard',
  '/messages',
  '/notifications',
  '/profile',
];

// Routes that are always public
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/terms',
  '/privacy-policy',
  '/how-it-works',
  '/help-center',
  '/verify-email',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '?')
  );
  if (isPublic) return NextResponse.next();

  // Allow Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|gif|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  // Check for Firebase auth session cookie
  // Firebase sets __session cookie when using session-based auth.
  // For client-side Firebase auth, we use a custom cookie set at login.
  const authCookie =
    request.cookies.get('pj_auth')?.value ||
    request.cookies.get('__session')?.value;

  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
