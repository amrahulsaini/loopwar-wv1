import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/zone'];

// Routes that should redirect authenticated users
const authRoutes = ['/join', '/verify'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('sessionToken')?.value;
  const username = request.cookies.get('username')?.value;
  const isVerified = request.cookies.get('isVerified')?.value === 'true';
  
  const isAuthenticated = sessionToken && username && isVerified;
  
  console.log('Middleware:', {
    pathname,
    hasSessionToken: !!sessionToken,
    hasUsername: !!username,
    isVerified,
    isAuthenticated
  });

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    console.log('Redirecting to /join - not authenticated');
    return NextResponse.redirect(new URL('/join', request.url));
  }

  // If trying to access auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    console.log('Redirecting to /zone - already authenticated');
    return NextResponse.redirect(new URL('/zone', request.url));
  }

  // If trying to access verify page without a session (but allow unverified users)
  if (pathname === '/verify' && (!sessionToken || !username)) {
    console.log('Redirecting to /join - no session for verification');
    return NextResponse.redirect(new URL('/join', request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
