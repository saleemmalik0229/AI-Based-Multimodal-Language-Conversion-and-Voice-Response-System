/**
 * Text-to-Speech (TTS) Manager
 * Server-Side Cloud Audio Synthesis Player.
 *
 * Replaces client-side browser speechSynthesis with server-side Cloud Text-to-Speech
 * for all 5 supported languages: English (en-IN), Telugu (te-IN), Hindi (hi-IN),
 * Tamil (ta-IN), and Malayalam (ml-IN).
 *
 * Eliminates all device-dependent OS voice pack errors.
 */

export type TTSPlaybackState = 'idle' | 'loading' | 'speaking' | 'paused';

export class TTSManager {
  private audioElement: HTMLAudioElement | null = null;
  private playbackState: TTSPlaybackState = 'idle';
  private abortController: AbortController | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && typeof Audio !== 'undefined';
  }

  public getState(): TTSPlaybackState {
    return this.playbackState;
  }

  public hasVoiceForLanguage(_languageName: string): boolean {
    // Cloud TTS natively supports all 5 languages without device packs
    return true;
  }

  /**
   * Speak text in the given language via server-side Text-to-Speech.
   * Cancels any currently playing audio first.
   */
  public async speak(
    text: string,
    languageName: string = 'English',
    onEnd?: () => void,
    onError?: (err: string) => void,
    onStateChange?: (state: TTSPlaybackState) => void
  ): Promise<boolean> {
    if (!this.isSupported()) {
      onError?.('Audio playback is not supported in this browser.');
      return false;
    }

    if (!text || !text.trim()) return false;

    // Stop active playback and cancel ongoing synthesis fetch
    this.stop();

    this.playbackState = 'loading';
    onStateChange?.('loading');

    this.abortController = new AbortController();

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language: languageName,
        }),
        signal: this.abortController.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.audioContent) {
        throw new Error(data.error || 'Failed to generate voice audio.');
      }

      // If playback was stopped while network request was pending, abort
      if (this.playbackState !== 'loading') {
        return false;
      }

      const audioSrc = `data:${data.mimeType || 'audio/mp3'};base64,${data.audioContent}`;
      const audio = new Audio(audioSrc);
      this.audioElement = audio;

      audio.onplay = () => {
        this.playbackState = 'speaking';
        onStateChange?.('speaking');
      };

      audio.onpause = () => {
        if (!audio.ended && this.playbackState !== 'idle') {
          this.playbackState = 'paused';
          onStateChange?.('paused');
        }
      };

      audio.onended = () => {
        this.playbackState = 'idle';
        this.audioElement = null;
        onStateChange?.('idle');
        onEnd?.();
      };

      audio.onerror = () => {
        this.playbackState = 'idle';
        this.audioElement = null;
        onStateChange?.('idle');
        onError?.('Error during audio playback. Please try again.');
      };

      await audio.play();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Synthesis cancelled by user calling stop()
        return false;
      }

      this.playbackState = 'idle';
      this.audioElement = null;
      onStateChange?.('idle');
      onError?.(err.message || 'Speech generation encountered an issue. You can still read the translation.');
      return false;
    }
  }

  public pause(): void {
    if (this.audioElement && this.playbackState === 'speaking') {
      this.audioElement.pause();
      this.playbackState = 'paused';
    }
  }

  public resume(): void {
    if (this.audioElement && this.playbackState === 'paused') {
      this.audioElement.play().catch(() => {});
      this.playbackState = 'speaking';
    }
  }

  public stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }

    this.playbackState = 'idle';
  }
}
