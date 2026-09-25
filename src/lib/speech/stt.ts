/**
 * Speech-to-Text (STT) Module with BCP-47 Speech Recognition Locale Support
 */

export interface STTState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

export type STTCallback = (transcript: string) => void;

export const STT_LOCALES: Record<string, { label: string; bcp47: string }> = {
  English: { label: 'English', bcp47: 'en-IN' },
  Telugu: { label: 'Telugu', bcp47: 'te-IN' },
  Hindi: { label: 'Hindi', bcp47: 'hi-IN' },
  Tamil: { label: 'Tamil', bcp47: 'ta-IN' },
  Malayalam: { label: 'Malayalam', bcp47: 'ml-IN' },
};

export class STTManager {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN';
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(
    onResult: STTCallback,
    onError?: (err: string) => void,
    bcp47Locale: string = 'en-IN'
  ): boolean {
    if (!this.recognition) {
      onError?.('Speech recognition is not supported in this browser.');
      return false;
    }

    if (this.isListening) return true;

    try {
      // Apply selected BCP-47 locale prior to starting speech recognition
      this.recognition.lang = bcp47Locale;

      this.recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        onResult(currentTranscript);
      };

      this.recognition.onerror = (event: any) => {
        onError?.(event.error || 'Speech recognition error occurred.');
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch {
      onError?.('Failed to start speech recognition.');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore stop errors
      }
      this.isListening = false;
    }
  }
}
