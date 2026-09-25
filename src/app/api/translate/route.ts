import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { groqService } from '@/lib/ai/groq';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types';

const TIMEOUT_MS = 15000; // 15-second server timeout

export async function POST(request: Request) {
  try {
    // 1. Session Protection
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // 2. Payload Validation
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { text, targetLanguage } = body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter valid text to translate.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    if (trimmedText.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum limit of 5000 characters.' },
        { status: 400 }
      );
    }

    if (!targetLanguage || !SUPPORTED_LANGUAGES.includes(targetLanguage as SupportedLanguage)) {
      return NextResponse.json(
        {
          success: false,
          error: `Target language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 3. Perform Translation with Groq LLM & 15s Server Timeout
    const translationPromise = groqService.translateText(
      trimmedText,
      targetLanguage as SupportedLanguage
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Translation request timed out. Please try again.')),
        TIMEOUT_MS
      )
    );

    const result = await Promise.race([translationPromise, timeoutPromise]);

    // 4. Low-Confidence Ambiguous Input Handling
    if (result.confidence === 'low' && trimmedText.split(/\s+/).length <= 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter or speak a longer phrase so the language can be identified accurately.',
        },
        { status: 422 }
      );
    }

    // 5. Source Language Support Check
    const normalizedDetected = result.detectedLanguage.toLowerCase();
    const matchedSupported = SUPPORTED_LANGUAGES.find(
      (lang) => lang.toLowerCase() === normalizedDetected || normalizedDetected.includes(lang.toLowerCase())
    );

    if (!matchedSupported) {
      return NextResponse.json(
        {
          success: false,
          error: `The source language ('${result.detectedLanguage}') is not currently supported. Please enter text in English, Telugu, Hindi, Tamil, or Malayalam.`,
        },
        { status: 422 }
      );
    }

    // 6. Public Response (Strictly ONLY detectedLanguage and translatedText)
    return NextResponse.json({
      success: true,
      detectedLanguage: matchedSupported,
      translatedText: result.translatedText,
    });
  } catch (error: any) {
    console.error('[Translation Route Error]:', error.message || 'Error executing translation');

    const status = error.message?.includes('timed out') ? 504 : 500;
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unable to translate right now. Please try again.',
      },
      { status }
    );
  }
}
