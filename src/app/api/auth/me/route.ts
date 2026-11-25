import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCorsHeaders, handleOptionsPreflight } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleOptionsPreflight(request);
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { authenticated: true, user: session },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Me API Error]:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500, headers: corsHeaders }
    );
  }
}
