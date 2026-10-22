/**
 * Text-to-Speech (TTS) Manager
 * Browser Web Speech API SpeechSynthesis Abstraction with full playback controls.
 *
 * Key design decisions:
 * - Voices are loaded asynchronously via the voiceschanged event.
 * - Voice matching uses lowercase comparison to avoid case-sensitivity bugs.
 * - For non-English Indian languages, if NO matching voice is found, we surface
 *   a clear error rather than silently using the English/default voice.
 * - Telugu uses BCP-47 tag "te-IN"; matched via voice.lang.toLowerCase().startsWith("te").
 */

export type TTSPlaybackState = 'idle' | 'speaking' | 'paused';

export class TTSManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private playbackState: TTSPlaybackState = 'idle';

  // BCP-47 language codes for TTS
  private static readonly LANG_MAP: Record<string, string> = {
    English: 'en-US',
    Telugu: 'te-IN',
    Hindi: 'hi-IN',
    Tamil: 'ta-IN',
    Malayalam: 'ml-IN',
  };

  /**
   * Languages that should NOT silently fall back to the browser default voice
   * when no matching voice is found. For these, we surface a clear error instead
   * of reading native-script text in an English voice.
   */
  private static readonly NO_SILENT_FALLBACK = new Set([
    'Telugu',
    'Tamil',
    'Malayalam',
    'Hindi',
  ]);

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Trigger voice list load immediately; some browsers need this.
      this.synth.getVoices();
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public getState(): TTSPlaybackState {
    return this.playbackState;
  }

  /**
   * Returns a Promise that resolves with the full loaded voice list.
   * Handles the async voiceschanged pattern correctly for all browsers.
   */
  private getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve([]);
        return;
      }

      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Voices not yet loaded — wait for voiceschanged event.
      const onVoicesChanged = () => {
        this.synth!.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(this.synth!.getVoices());
      };
      this.synth.addEventListener('voiceschanged', onVoicesChanged);

      // Safety timeout: if voiceschanged never fires (e.g. Firefox quirk), resolve after 1.5s.
      setTimeout(() => {
        this.synth!.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(this.synth!.getVoices());
      }, 1500);
    });
  }

  /**
   * Find the best matching voice for a BCP-47 code using case-insensitive comparison.
   * Returns null if no matching voice is found.
   */
  private findVoice(
    voices: SpeechSynthesisVoice[],
    langCode: string
  ): SpeechSynthesisVoice | null {
    const lower = langCode.toLowerCase();
    const baseLang = lower.split('-')[0]; // e.g. "te" from "te-in"

    // 1. Exact match (case-insensitive)
    const exact = voices.find((v) => v.lang.toLowerCase() === lower);
    if (exact) return exact;

    // 2. Base language prefix match (case-insensitive) — e.g. "te-IN", "te-IN-x-etc"
    const prefix = voices.find((v) =>
      v.lang.toLowerCase().startsWith(baseLang)
    );
    if (prefix) return prefix;

    return null;
  }

  /**
   * Check if a voice is available for the given language name.
   * Returns false if voices have loaded and no match exists.
   * Returns true if voices haven't loaded yet (optimistic).
   */
  public hasVoiceForLanguage(languageName: string): boolean {
    if (!this.synth) return false;
    const langCode = TTSManager.LANG_MAP[languageName] || 'en-US';
    const voices = this.synth.getVoices();
    if (voices.length === 0) return true; // Not yet loaded — optimistic
    return this.findVoice(voices, langCode) !== null;
  }

  /**
   * Speak text in the given language.
   * Loads voices asynchronously before attempting to speak.
   * For Indian languages, surfaces a clear error if no matching voice is found.
   * Cancels any currently playing speech first.
   */
  public speak(
    text: string,
    languageName: string = 'English',
    onEnd?: () => void,
    onError?: (err: string) => void,
    onStateChange?: (state: TTSPlaybackState) => void
  ): boolean {
    if (!this.synth) {
      onError?.(
        'Speech playback is not supported in this browser. You can still read the translation above.'
      );
      return false;
    }

    if (!text || !text.trim()) return false;

    // Cancel any active utterance first to prevent overlap.
    this.stop();

    const langCode = TTSManager.LANG_MAP[languageName] || 'en-US';

    // Signal speaking state immediately so UI updates without waiting for async voice load.
    this.playbackState = 'speaking';
    onStateChange?.('speaking');

    // Load voices asynchronously, then speak.
    this.getVoicesAsync().then((voices) => {
      // If stop() was called while we were loading voices, abort.
      if (this.playbackState !== 'speaking') return;

      const matchedVoice = voices.length > 0 ? this.findVoice(voices, langCode) : null;

      // For non-English Indian languages: if voices have loaded and none matched,
      // surface a clear error instead of silently using the default (English) voice
      // which would incorrectly read native-script text.
      if (
        voices.length > 0 &&
        matchedVoice === null &&
        TTSManager.NO_SILENT_FALLBACK.has(languageName)
      ) {
        this.playbackState = 'idle';
        onStateChange?.('idle');
        onError?.(
          `No ${languageName} voice is installed on this device. To enable ${languageName} speech, install a ${languageName} language pack in your OS settings. The translation text is shown above.`
        );
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      // For English, silently use system default if no en-US voice found (acceptable fallback).

      utterance.onstart = () => {
        this.playbackState = 'speaking';
        onStateChange?.('speaking');
      };

      utterance.onend = () => {
        this.playbackState = 'idle';
        this.currentUtterance = null;
        onStateChange?.('idle');
        onEnd?.();
      };

      utterance.onerror = (e) => {
        this.playbackState = 'idle';
        this.currentUtterance = null;
        onStateChange?.('idle');
        // 'interrupted' / 'canceled' happen on manual stop — not real errors.
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          onError?.(this.mapSpeechError(e.error, languageName));
        } else {
          onEnd?.();
        }
      };

      try {
        this.currentUtterance = utterance;
        this.synth!.speak(utterance);
      } catch {
        this.playbackState = 'idle';
        this.currentUtterance = null;
        onStateChange?.('idle');
        onError?.('Failed to start speech playback. Please try again.');
      }
    });

    return true;
  }

  public pause(): void {
    if (this.synth && this.playbackState === 'speaking') {
      this.synth.pause();
      this.playbackState = 'paused';
    }
  }

  public resume(): void {
    if (this.synth && this.playbackState === 'paused') {
      this.synth.resume();
      this.playbackState = 'speaking';
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.playbackState = 'idle';
    this.currentUtterance = null;
  }

  private mapSpeechError(error: string, languageName: string): string {
    switch (error) {
      case 'language-unavailable':
        return `No ${languageName} voice is installed on this device. Install a ${languageName} language pack in your OS settings to enable speech output.`;
      case 'voice-unavailable':
        return `No ${languageName} voice is available in this browser. The translation text is shown above.`;
      case 'not-allowed':
        return 'Speech playback was blocked by the browser. Please check your browser settings.';
      case 'audio-busy':
        return 'Audio is currently busy. Please wait a moment and try again.';
      case 'network':
        return 'A network error occurred during speech playback.';
      case 'synthesis-unavailable':
        return 'Speech synthesis is not available on this device.';
      case 'synthesis-failed':
        return 'Speech synthesis failed. Please try again.';
      default:
        return 'Speech playback encountered an issue. You can still read the translation.';
    }
  }
}
