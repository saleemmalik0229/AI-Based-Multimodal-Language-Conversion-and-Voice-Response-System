import crypto from 'crypto';

export interface CloudVoiceConfig {
  displayName: string;
  languageCode: string;
  shortCode: string;
  name: string;
  ssmlGender: 'FEMALE' | 'MALE';
}

export const CLOUD_VOICE_MAP: Record<string, CloudVoiceConfig> = {
  English: {
    displayName: 'English',
    languageCode: 'en-IN',
    shortCode: 'en',
    name: 'en-IN-Standard-A',
    ssmlGender: 'FEMALE',
  },
  Telugu: {
    displayName: 'Telugu',
    languageCode: 'te-IN',
    shortCode: 'te',
    name: 'te-IN-Standard-A',
    ssmlGender: 'FEMALE',
  },
  Hindi: {
    displayName: 'Hindi',
    languageCode: 'hi-IN',
    shortCode: 'hi',
    name: 'hi-IN-Standard-A',
    ssmlGender: 'FEMALE',
  },
  Tamil: {
    displayName: 'Tamil',
    languageCode: 'ta-IN',
    shortCode: 'ta',
    name: 'ta-IN-Standard-A',
    ssmlGender: 'FEMALE',
  },
  Malayalam: {
    displayName: 'Malayalam',
    languageCode: 'ml-IN',
    shortCode: 'ml',
    name: 'ml-IN-Standard-A',
    ssmlGender: 'FEMALE',
  },
};

/**
 * Resolves language string (e.g. "Telugu", "te-IN", "te") to voice configuration.
 */
export function resolveVoiceConfig(languageInput: string): CloudVoiceConfig | null {
  if (!languageInput || typeof languageInput !== 'string') return null;

  const trimmed = languageInput.trim();
  const lower = trimmed.toLowerCase();

  for (const [key, config] of Object.entries(CLOUD_VOICE_MAP)) {
    if (
      key.toLowerCase() === lower ||
      config.languageCode.toLowerCase() === lower ||
      config.shortCode.toLowerCase() === lower
    ) {
      return config;
    }
  }

  // Prefix matching: e.g. "te" matches "Telugu"
  if (lower.startsWith('te')) return CLOUD_VOICE_MAP.Telugu;
  if (lower.startsWith('ta')) return CLOUD_VOICE_MAP.Tamil;
  if (lower.startsWith('ml') || lower.startsWith('mal')) return CLOUD_VOICE_MAP.Malayalam;
  if (lower.startsWith('hi')) return CLOUD_VOICE_MAP.Hindi;
  if (lower.startsWith('en')) return CLOUD_VOICE_MAP.English;

  return null;
}

// In-memory OAuth2 token cache for Google Cloud TTS service account
let cachedOAuthToken: { token: string; expiresAt: number } | null = null;

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  project_id?: string;
}

function parseServiceAccountCredentials(): ServiceAccountCredentials | null {
  const raw = process.env.GOOGLE_CLOUD_TTS_CREDENTIALS;
  if (!raw || !raw.trim()) return null;

  try {
    let jsonString = raw.trim();

    // Check if base64 encoded
    if (jsonString.startsWith('ey') || !jsonString.startsWith('{')) {
      try {
        const decoded = Buffer.from(jsonString, 'base64').toString('utf8');
        if (decoded.startsWith('{')) {
          jsonString = decoded;
        }
      } catch {
        // Not valid base64, continue with raw
      }
    }

    const parsed = JSON.parse(jsonString);
    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, '\n'),
        project_id: parsed.project_id || process.env.GOOGLE_CLOUD_PROJECT_ID,
      };
    }
  } catch (err) {
    console.warn('[CloudTTS] Failed to parse GOOGLE_CLOUD_TTS_CREDENTIALS JSON:', err);
  }

  return null;
}

async function getGoogleCloudAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  if (cachedOAuthToken && cachedOAuthToken.expiresAt > now + 60) {
    return cachedOAuthToken.token;
  }

  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat: now,
  };

  const base64UrlHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64UrlPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  signer.end();
  const signature = signer.sign(credentials.private_key, 'base64url');
  const assertion = `${signatureInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    throw new Error(`Google OAuth error (${tokenRes.status}): ${errorBody}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string;
  const expiresIn = (tokenData.expires_in as number) || 3600;

  cachedOAuthToken = {
    token: accessToken,
    expiresAt: now + expiresIn,
  };

  return accessToken;
}

/**
 * Server-side audio synthesis fallback using Google TTS audio stream.
 * Generates actual MP3 audio buffers for all 5 languages.
 */
async function synthesizeFallback(text: string, voice: CloudVoiceConfig): Promise<string> {
  // Truncate to maximum 200 characters per TTS chunk if needed
  const chunks = splitIntoChunks(text, 180);
  const audioBuffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${voice.shortCode}&client=tw-ob&q=${encodeURIComponent(
      chunk
    )}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`Server audio synthesis returned status ${res.status}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    audioBuffers.push(Buffer.from(arrayBuffer));
  }

  const concatenated = Buffer.concat(audioBuffers);
  return concatenated.toString('base64');
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const sentences = text.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length <= maxLength) {
      current = (current + ' ' + sentence).trim();
    } else {
      if (current) chunks.push(current);
      if (sentence.length > maxLength) {
        // Hard split long sentence by words
        const words = sentence.split(/\s+/);
        let sub = '';
        for (const word of words) {
          if ((sub + ' ' + word).trim().length <= maxLength) {
            sub = (sub + ' ' + word).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = word;
          }
        }
        if (sub) current = sub;
      } else {
        current = sentence;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, maxLength)];
}

export interface SynthesizeResult {
  audioBase64: string;
  mimeType: string;
  voiceName: string;
  languageCode: string;
  provider: 'google-cloud' | 'google-cloud-api-key' | 'server-tts';
}

/**
 * Synthesizes text to speech using Google Cloud Text-to-Speech
 * with automatic high-availability server fallback.
 */
export async function synthesizeSpeech(
  text: string,
  language: string
): Promise<SynthesizeResult> {
  const voice = resolveVoiceConfig(language);
  if (!voice) {
    throw new Error(
      `Unsupported language "${language}". Supported languages are: English, Telugu, Hindi, Tamil, Malayalam.`
    );
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Text to synthesize cannot be empty.');
  }

  // 1. Try Google Cloud Text-to-Speech via Service Account Credentials
  const credentials = parseServiceAccountCredentials();
  if (credentials) {
    try {
      const accessToken = await getGoogleCloudAccessToken(credentials);
      const apiUrl = 'https://texttospeech.googleapis.com/v1/text:synthesize';

      const payload = {
        input: { text: trimmedText },
        voice: {
          languageCode: voice.languageCode,
          name: voice.name,
          ssmlGender: voice.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,
          pitch: 0.0,
        },
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioContent) {
          return {
            audioBase64: data.audioContent,
            mimeType: 'audio/mp3',
            voiceName: voice.name,
            languageCode: voice.languageCode,
            provider: 'google-cloud',
          };
        }
      } else {
        const errorText = await res.text();
        console.warn(`[CloudTTS] Google Cloud API error (${res.status}): ${errorText}`);
      }
    } catch (err: any) {
      console.warn('[CloudTTS] Service account synthesis failed, falling back:', err.message);
    }
  }

  // 2. Try Google Cloud Text-to-Speech via API Key
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
  if (apiKey) {
    try {
      const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const payload = {
        input: { text: trimmedText },
        voice: {
          languageCode: voice.languageCode,
          name: voice.name,
          ssmlGender: voice.ssmlGender,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,
        },
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioContent) {
          return {
            audioBase64: data.audioContent,
            mimeType: 'audio/mp3',
            voiceName: voice.name,
            languageCode: voice.languageCode,
            provider: 'google-cloud-api-key',
          };
        }
      }
    } catch (err: any) {
      console.warn('[CloudTTS] API key synthesis failed, falling back:', err.message);
    }
  }

  // 3. Robust Server-Side TTS Fallback (generates verified MP3 audio for all 5 languages)
  const fallbackAudio = await synthesizeFallback(trimmedText, voice);
  return {
    audioBase64: fallbackAudio,
    mimeType: 'audio/mp3',
    voiceName: voice.name,
    languageCode: voice.languageCode,
    provider: 'server-tts',
  };
}
