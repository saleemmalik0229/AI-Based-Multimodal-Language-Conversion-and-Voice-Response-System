import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCorsHeaders, handleOptionsPreflight } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleOptionsPreflight(request);
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  const startTime = Date.now();
  let dbStatus: { connected: boolean; latencyMs?: number; error?: string } = {
    connected: false,
  };

  try {
    const dbPingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = {
      connected: true,
      latencyMs: Date.now() - dbPingStart,
    };
  } catch (err: any) {
    dbStatus = {
      connected: false,
      error: err?.message ? String(err.message).slice(0, 150) : 'Database ping failed',
    };
  }

  // Environment variable status flags (strictly boolean, zero secrets exposed)
  const environment = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_TTS_CREDENTIALS: !!process.env.GOOGLE_CLOUD_TTS_CREDENTIALS,
  };

  const apis = {
    health: true,
    translate: !!process.env.GROQ_API_KEY,
    speechToText: !!process.env.GROQ_API_KEY,
    textToSpeech: true, // Google Cloud TTS / server fallback supports all 5 languages
    auth: dbStatus.connected && environment.DATABASE_URL,
  };

  const isHealthy = dbStatus.connected && environment.GROQ_API_KEY;
  const status = isHealthy ? 'healthy' : 'degraded';

  const responseBody = {
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    responseTimeMs: Date.now() - startTime,
    database: dbStatus,
    environment,
    apis,
    version: '1.0.0',
    cors: {
      allowedOrigin: corsHeaders['Access-Control-Allow-Origin'],
      credentials: true,
    },
  };

  return NextResponse.json(responseBody, {
    status: 200,
    headers: corsHeaders,
  });
}
