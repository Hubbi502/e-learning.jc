import { NextRequest, NextResponse } from "next/server";
import { TokenService } from "./service/auth/services/token.service";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/api/admin'];
  const authRoutes = ['/login'];

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Get the auth token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If it's a protected route and there's a token, verify it from database
  if (isProtectedRoute && token) {
    const validatedToken = await TokenService.validateToken(token);
    
    if (!validatedToken) {
      // Token is invalid or revoked, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    const validatedToken = await TokenService.validateToken(token);
    
    if (validatedToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
