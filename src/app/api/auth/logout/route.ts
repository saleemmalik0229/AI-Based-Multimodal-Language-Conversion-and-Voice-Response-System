import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout API Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout. Please try again.' },
      { status: 500 }
    );
  }
}
