import { NextResponse } from 'next/server';

export const ALLOWED_ORIGIN = 'https://www.web-a2z.com';

const ALLOWED_ORIGINS = new Set([
  'https://www.web-a2z.com',
  'https://web-a2z.com',
  'https://ai-voice-translator-three.vercel.app',
  'null', // Required for Web-A2Z sandboxed CSP execution
]);

export function getCorsHeaders(origin: string | null = null): Record<string, string> {
  let allowOrigin = ALLOWED_ORIGIN;
  let allowCredentials = 'true';

  if (origin) {
    const trimmedOrigin = origin.trim();
    if (
      ALLOWED_ORIGINS.has(trimmedOrigin) ||
      trimmedOrigin.endsWith('.web-a2z.com') ||
      trimmedOrigin.endsWith('web-a2z.com')
    ) {
      allowOrigin = trimmedOrigin;
    } else if (
      process.env.NODE_ENV !== 'production' &&
      (trimmedOrigin.startsWith('http://localhost') || trimmedOrigin.startsWith('http://127.0.0.1'))
    ) {
      allowOrigin = trimmedOrigin;
    }
  }

  // Under W3C Fetch specification:
  // Access-Control-Allow-Credentials cannot be 'true' when Access-Control-Allow-Origin is 'null' or '*'
  if (allowOrigin === 'null' || allowOrigin === '*') {
    allowCredentials = 'false';
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (allowCredentials === 'true') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}

export function applyCorsHeaders<T extends Response | NextResponse>(
  response: T,
  origin: string | null = null
): T {
  const headers = getCorsHeaders(origin);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function handleOptionsPreflight(request: Request): NextResponse {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
