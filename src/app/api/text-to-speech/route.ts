import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { synthesizeSpeech, resolveVoiceConfig } from '@/lib/speech/cloudTts';
import { getCorsHeaders, handleOptionsPreflight } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleOptionsPreflight(request);
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    // 1. Session Protection
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse and Validate Request Payload
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body. Expected JSON.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { text, language } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide valid text to synthesize.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum limit of 5000 characters.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const voiceConfig = resolveVoiceConfig(language);
    if (!voiceConfig) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unsupported language. Supported languages are: English, Telugu, Hindi, Tamil, Malayalam.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Synthesize Speech
    const result = await synthesizeSpeech(trimmedText, language);

    return NextResponse.json(
      {
        success: true,
        audioContent: result.audioBase64,
        mimeType: result.mimeType,
        voiceName: result.voiceName,
        languageCode: result.languageCode,
        provider: result.provider,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Text-to-Speech Route Error]:', error.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to synthesize speech audio.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
