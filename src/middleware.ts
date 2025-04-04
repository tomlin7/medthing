import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;
  
  // For debugging
  console.log(`[Middleware] Path: ${path}, Token: ${token ? 'exists' : 'missing'}`);
  
  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/' || 
    path.startsWith('/_next') || 
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.startsWith('/images');
  
  // Define protected paths that require authentication
  const isProtectedPath = 
    path.startsWith('/dashboard') || 
    path.startsWith('/patients') || 
    path.startsWith('/appointments') ||
    path.startsWith('/medications') ||
    path.startsWith('/metrics');
  
  // Case 1: User is logged in (has token) and tries to access login page
  if (path === '/' && token) {
    console.log('[Middleware] User is logged in, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Case 2: User is not logged in (no token) and tries to access protected route
  if (isProtectedPath && !token) {
    console.log('[Middleware] No token found, redirecting to login page');
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Otherwise, proceed normally
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But include:
     * - / (login page)
     * - /dashboard, /patients, /appointments, etc. (protected routes)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 