import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
// Note: We check these manually in the code below, not with startsWith
const protectedRoutes = ['/zone', '/admin'];

// Routes that should redirect authenticated users
const authRoutes = ['/join', '/verify'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug: Log if this is an API route that somehow hit middleware
  if (pathname.startsWith('/api')) {
    console.log('⚠️ MIDDLEWARE: API route hit middleware (should not happen):', pathname);
  }
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('sessionToken')?.value;
  const username = request.cookies.get('username')?.value;
  const isVerifiedCookie = request.cookies.get('isVerified')?.value;
  // Handle both 'true' and '1' as verified (database can store as boolean or int)
  const isVerified = isVerifiedCookie === 'true' || isVerifiedCookie === '1';
  
  const isAuthenticated = sessionToken && username && isVerified;
  
  console.log('Middleware:', {
    pathname,
    hasSessionToken: !!sessionToken,
    hasUsername: !!username,
    isVerifiedCookie, // Show the actual cookie value
    isVerified,
    isAuthenticated
  });

  // Check if the route is protected
  // Only protect exact /zone path and admin routes, not zone subpaths like problem pages
  const isProtectedRoute = pathname === '/zone' || pathname.startsWith('/admin');
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access protected route without authentication
    if (isProtectedRoute && !isAuthenticated) {
      console.log('Redirecting to /join - not authenticated');
      // Add ?next=originalPath to /join so login can redirect back
      const nextUrl = new URL('/join', request.url);
      nextUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(nextUrl);
    }

  // If trying to access auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    console.log('Redirecting to /zone - already authenticated');
    return NextResponse.redirect(new URL('/zone', request.url));
  }

  // If trying to access verify page without a session (but allow unverified users)
  if (pathname === '/verify') {
    // Allow access if user has userId parameter (from signup redirect)
    const userId = request.nextUrl.searchParams.get('userId');
    if (userId) {
      console.log('Allowing /verify access with userId:', userId);
      return NextResponse.next();
    }
    // Also allow if user has username cookie (in case they refresh the page)
    if (username) {
      console.log('Allowing /verify access with username cookie');
      return NextResponse.next();
    }
    // Only redirect if no userId param and no username cookie
    console.log('Redirecting to /join - no session or userId for verification');
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
