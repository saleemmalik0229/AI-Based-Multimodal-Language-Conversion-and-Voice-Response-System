import { NextResponse } from 'next/server';

export const ALLOWED_ORIGIN = 'https://www.web-a2z.com';

const ALLOWED_ORIGINS = [
  'https://www.web-a2z.com',
  'https://ai-voice-translator-three.vercel.app',
];

export function getCorsHeaders(origin: string | null = null): Record<string, string> {
  let allowOrigin = ALLOWED_ORIGIN;

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      allowOrigin = origin;
    } else if (
      process.env.NODE_ENV !== 'production' &&
      (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))
    ) {
      allowOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    'Access-Control-Max-Age': '86400',
  };
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
