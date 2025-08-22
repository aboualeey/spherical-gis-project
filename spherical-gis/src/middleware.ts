import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Get the token from the request
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Check if the user is authenticated
  const isAuthenticated = !!token;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/public', '/api/auth', '/unauthorized'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If the route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If the user is trying to access a protected route and is not authenticated
  if (!isAuthenticated) {
    // For admin routes, redirect to signup with a clear message and maintain destination URL
    if (pathname.startsWith('/admin')) {
      const signupUrl = new URL('/signup', request.url);
      signupUrl.searchParams.set('message', 'Please sign in to access admin features');
      signupUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(signupUrl);
    }
    
    // For other protected routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname + search);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check role-based access for admin routes
  if (pathname.startsWith('/admin')) {
    const userRole = token?.role as string;
    
    // Define roles that can access admin routes
    const adminRoles = ['MANAGING_DIRECTOR', 'ADMIN', 'INVENTORY_MANAGER', 'CASHIER', 'REPORT_VIEWER'];
    const canAccessAdmin = adminRoles.includes(userRole);
    
    // If the user doesn't have the required role, redirect to unauthorized page
    if (!canAccessAdmin) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      unauthorizedUrl.searchParams.set('message', 'You do not have permission to access admin features');
      unauthorizedUrl.searchParams.set('requiredRole', 'Admin access required');
      return NextResponse.redirect(unauthorizedUrl);
    }
    
    // Additional role-based restrictions for specific admin routes
    const restrictedRoutes = {
      '/admin/users': ['MANAGING_DIRECTOR', 'ADMIN'],
      '/admin/staff-management': ['MANAGING_DIRECTOR'],
      '/admin/settings': ['MANAGING_DIRECTOR'],
      '/admin/reports': ['MANAGING_DIRECTOR', 'ADMIN', 'REPORT_VIEWER'],
      '/admin/products': ['MANAGING_DIRECTOR', 'ADMIN', 'INVENTORY_MANAGER'],
      '/admin/inventory': ['MANAGING_DIRECTOR', 'ADMIN', 'INVENTORY_MANAGER'],
      '/admin/sales': ['MANAGING_DIRECTOR', 'ADMIN', 'CASHIER'],
    };
    
    for (const [route, allowedRoles] of Object.entries(restrictedRoutes)) {
      if (pathname.startsWith(route) && !allowedRoles.includes(userRole)) {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('message', `Access denied. Required role: ${allowedRoles.join(' or ')}`);
        unauthorizedUrl.searchParams.set('currentRole', userRole);
        return NextResponse.redirect(unauthorizedUrl);
      }
    }
  }
  
  // Allow access to the requested route
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Next Auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\.svg).*)',
  ],
};