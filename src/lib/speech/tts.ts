/**
 * Text-to-Speech (TTS) Foundation Module for Phase 1 & 3
 * Browser Web Speech API SpeechSynthesis Abstraction
 */

export class TTSManager {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public speak(
    text: string,
    languageName: string = 'English',
    onEnd?: () => void,
    onError?: (err: string) => void
  ): boolean {
    if (!this.synth) {
      onError?.('Speech synthesis is not supported in this browser.');
      return false;
    }

    if (!text || !text.trim()) return false;

    // Cancel any active utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Map target language to BCP 47 code
    const langMap: Record<string, string> = {
      English: 'en-US',
      Telugu: 'te-IN',
      Hindi: 'hi-IN',
      Tamil: 'ta-IN',
      Malayalam: 'ml-IN',
    };

    utterance.lang = langMap[languageName] || 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = (e) => {
      onError?.(e.error || 'Playback error occurred.');
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch {
      onError?.('Failed to synthesize speech.');
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
