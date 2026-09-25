import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch (error) {
    console.error('[Me API Error]:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
