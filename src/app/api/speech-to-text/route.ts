import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { groqService } from '@/lib/ai/groq';
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

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided in request.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Recorded audio file is empty. Please speak clearly into the microphone.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Maximum file size check (25 MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio file size exceeds maximum limit of 25MB.',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Convert File blob to Node Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || 'audio/webm';
    const filename = audioFile.name || 'recording.webm';

    // 3. Delegate to Groq Whisper Service
    const result = await groqService.transcribeAudio(buffer, mimeType, filename);

    // 4. Return Public Response (Strictly ONLY recognized text)
    return NextResponse.json(
      {
        success: true,
        text: result.text,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error(
      '[Speech-to-Text Route Error]:',
      error.message || 'Error processing audio'
    );
    return NextResponse.json(
      {
        success: false,
        error:
          error.message || 'Failed to process speech input. Please try again.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
