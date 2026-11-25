import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'app-session';
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-ai-voice-translator-secret-key-2026'
);

const ALLOWED_ORIGIN = 'https://www.web-a2z.com';

function applyCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin === ALLOWED_ORIGIN) {
    response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Handle API CORS preflight OPTIONS requests immediately
  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      const preflightResponse = new NextResponse(null, { status: 204 });
      return applyCorsHeaders(preflightResponse, origin);
    }
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Protected Routes
  const isProtectedRoute = pathname.startsWith('/translator');
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/translator', request.url));
  }

  const response = NextResponse.next();
  if (pathname.startsWith('/api/')) {
    applyCorsHeaders(response, origin);
  }
  return response;
}

export const config = {
  matcher: ['/translator/:path*', '/auth/login', '/auth/register', '/api/:path*'],
};
