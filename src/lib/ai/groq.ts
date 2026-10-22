import Groq, { toFile } from 'groq-sdk';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '@/types';

export interface GroqTranslationResult {
  translatedText: string;
  detectedLanguage: string;
  confidence: 'high' | 'medium' | 'low';
  scriptType: 'native' | 'romanized' | 'mixed';
}

export class GroqService {
  private groq: Groq | null = null;
  private readonly defaultSttModel = 'whisper-large-v3';

  private getClient(): Groq {
    if (!this.groq) {
      const apiKey = process.env.GROQ_API_KEY;
      if (apiKey && apiKey.trim() !== '') {
        this.groq = new Groq({ apiKey });
      }
    }
    if (!this.groq) {
      console.error('[GroqService Error]: GROQ_API_KEY is missing or invalid on the server.');
      throw new Error('Groq service is not properly configured. Please check server environment.');
    }
    return this.groq;
  }

  public isConfigured(): boolean {
    try {
      this.getClient();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Performs server-side translation and semantic language detection using Groq LLM.
   * Model is read dynamically from process.env.GROQ_TRANSLATION_MODEL.
   */
  public async translateText(
    text: string,
    targetLanguage: SupportedLanguage
  ): Promise<GroqTranslationResult> {
    if (!text || !text.trim()) {
      throw new Error('Please enter valid text to translate.');
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      throw new Error(`Unsupported target language: ${targetLanguage}`);
    }

    const groqClient = this.getClient();

    const modelName = process.env.GROQ_TRANSLATION_MODEL;
    if (!modelName || modelName.trim() === '') {
      console.error('[GroqService Error]: GROQ_TRANSLATION_MODEL environment variable is not configured.');
      throw new Error('GROQ_TRANSLATION_MODEL is not configured on the server.');
    }

    try {
      const prompt = `You are a world-class computational linguist specializing in South Asian languages and multilingual detection.

TASK:
1. Detect the primary underlying language of the input text.
   - The input MAY be written in its native script (e.g., Telugu, Devanagari, Tamil, Malayalam script).
   - The input MAY be written in Romanized / Latin script (e.g., "nenu bagunnanu" -> Telugu, "aap kaise ho" -> Hindi, "vanakkam eppadi irukeenga" -> Tamil, "ningal engane undu" -> Malayalam).
   - The input MAY be code-mixed with English words (e.g., "nenu today college ki vellanu" -> Telugu, "mujhe office lo work undi" -> Hindi, "naan today office ku poren" -> Tamil, "enikku today college il pokanam" -> Malayalam).
   - CRITICAL: Do NOT assume that Latin/English characters imply English! Identify the dominant underlying language based on grammar, verb roots, sentence structure, and vocabulary.
   - English should ONLY be detected when the linguistic content and sentence structure are actually English (e.g., "How are you?").
2. Evaluate detection confidence:
   - "high": The language is clear and unambiguous.
   - "medium": Strong indicators exist for the language.
   - "low": Input is extremely short or genuinely ambiguous (e.g., single ambiguous words like "hello", "hai", "nanna").
3. Determine script type:
   - "native": Native Indic or English script.
   - "romanized": Indian language written using Latin characters.
   - "mixed": Mix of English words and Romanized native words.
4. If the detected language is identical to the requested target language (${targetLanguage}), return the original input text as translatedText.
5. Otherwise, translate the content accurately into natural ${targetLanguage}. Preserve formatting, numbers, names, and punctuation. Do NOT add conversational preambles or notes.

Target Language: ${targetLanguage}

Input Text:
${text}

Return your response in STRICT JSON format matching this exact schema:
{
  "detectedLanguage": "English | Telugu | Hindi | Tamil | Malayalam | <Other>",
  "confidence": "high | medium | low",
  "scriptType": "native | romanized | mixed",
  "translatedText": "The translated text in ${targetLanguage}"
}`;

      const response = await groqClient.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const rawText = response.choices[0]?.message?.content || '';
      if (!rawText.trim()) {
        throw new Error('Empty response from Groq translation provider.');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error('Invalid response structure from translation provider.');
      }

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.translatedText !== 'string' ||
        typeof parsed.detectedLanguage !== 'string'
      ) {
        throw new Error('Malformed translation payload.');
      }

      const detectedLanguage = parsed.detectedLanguage.trim();
      const translatedText = parsed.translatedText.trim();
      const confidence = (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'high') as 'high' | 'medium' | 'low';
      const scriptType = (['native', 'romanized', 'mixed'].includes(parsed.scriptType) ? parsed.scriptType : 'native') as 'native' | 'romanized' | 'mixed';

      return {
        detectedLanguage,
        confidence,
        scriptType,
        translatedText,
      };
    } catch (err: any) {
      console.error('[GroqService Server Error]:', err.message || 'Groq API call failed');
      throw new Error('Unable to translate right now. Please try again.');
    }
  }

  /**
   * Transcribes recorded audio buffer using Groq Whisper.
   * Uses multilingual script priming and script verification to ensure accurate
   * native script transcription across English, Telugu, Hindi, Tamil, and Malayalam.
   */
  public async transcribeAudio(
    audioBuffer: Buffer,
    mimeType: string,
    filename: string = 'recording.webm'
  ): Promise<{ text: string }> {
    const groqClient = this.getClient();

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Audio recording is empty.');
    }

    const modelName = process.env.GROQ_STT_MODEL || this.defaultSttModel;
    const initialPrompt = 'English, తెలుగు, हिन्दी, தமிழ், മലയാളം.';

    // Script configuration for supported Indic languages
    const indicScriptConfigs: Record<
      string,
      { code: 'te' | 'hi' | 'ta' | 'ml'; scriptRegex: RegExp; prompt: string }
    > = {
      telugu: {
        code: 'te',
        scriptRegex: /[\u0C00-\u0C7F]/,
        prompt: 'తెలుగులో మాట్లాడటం.',
      },
      hindi: {
        code: 'hi',
        scriptRegex: /[\u0900-\u097F]/,
        prompt: 'हिन्दी में बातचीत.',
      },
      tamil: {
        code: 'ta',
        scriptRegex: /[\u0B80-\u0BFF]/,
        prompt: 'தமிழில் பேசுவது.',
      },
      malayalam: {
        code: 'ml',
        scriptRegex: /[\u0D00-\u0D7F]/,
        prompt: 'മലയാളത്തിൽ സംസാരിക്കുന്നത്.',
      },
    };

    const sttLangMap: Record<string, string> = {
      telugu: 'telugu',
      te: 'telugu',
      hindi: 'hindi',
      hi: 'hindi',
      tamil: 'tamil',
      ta: 'tamil',
      malayalam: 'malayalam',
      ml: 'malayalam',
      english: 'english',
      en: 'english',
    };

    try {
      const fileObj = await toFile(audioBuffer, filename, { type: mimeType });

      const transcription = await groqClient.audio.transcriptions.create({
        file: fileObj,
        model: modelName,
        prompt: initialPrompt,
        response_format: 'verbose_json',
      });

      let text = (transcription.text || '').trim();
      const detectedLangRaw = (((transcription as any).language || '') as string).toLowerCase().trim();
      const normalizedLang = sttLangMap[detectedLangRaw];

      // If an Indic language is detected, verify that the transcription uses its authentic script
      // without cross-script pollution (e.g. Devanagari script for Telugu or Tamil script for Malayalam)
      if (normalizedLang && indicScriptConfigs[normalizedLang]) {
        const config = indicScriptConfigs[normalizedLang];
        const hasCorrectScript = config.scriptRegex.test(text);

        // Check for presence of characters from any other Indic script
        const hasOtherIndicScript = Object.entries(indicScriptConfigs)
          .filter(([key]) => key !== normalizedLang)
          .some(([_, other]) => other.scriptRegex.test(text));

        // If expected script is absent or foreign Indic script is present, re-transcribe with forced language code and script prompt
        if (!hasCorrectScript || hasOtherIndicScript) {
          const fileObjRefined = await toFile(audioBuffer, filename, { type: mimeType });
          const refinedTranscription = await groqClient.audio.transcriptions.create({
            file: fileObjRefined,
            model: modelName,
            language: config.code,
            prompt: config.prompt,
            response_format: 'json',
          });

          const refinedText = (refinedTranscription.text || '').trim();
          if (refinedText) {
            text = refinedText;
          }
        }
      }

      if (!text) {
        throw new Error('No speech recognized in the audio recording.');
      }

      return { text };
    } catch (err: any) {
      console.error('[Groq STT Error]:', err.message || 'Groq Whisper transcription failed');
      throw new Error(err.message || 'Failed to transcribe audio recording. Please try speaking again.');
    }
  }
}

export const groqService = new GroqService();
