import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { getCorsHeaders, handleOptionsPreflight } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleOptionsPreflight(request);
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    await clearSessionCookie();
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Logout API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
