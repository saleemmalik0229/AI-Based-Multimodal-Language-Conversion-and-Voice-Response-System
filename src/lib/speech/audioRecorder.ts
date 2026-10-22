/**
 * Browser MediaRecorder audio recording helper module.
 * Dynamically detects browser supported audio MIME types.
 * Provides user-friendly error messages — never exposes internal details.
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public static getSupportedMimeType(): string {
    if (typeof window === 'undefined' || !window.MediaRecorder) {
      return 'audio/webm';
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }

  /**
   * Returns true if MediaRecorder API is available in this browser.
   */
  public static isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  public async start(): Promise<boolean> {
    if (!AudioRecorder.isSupported()) {
      throw new Error(
        'Voice input isn\'t supported in this browser. You can still type your message.'
      );
    }

    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = AudioRecorder.getSupportedMimeType();

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // collect 100ms chunks
      return true;
    } catch (err: any) {
      this.cleanup();

      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message?.includes('Permission denied')
      ) {
        throw new Error(
          'Microphone access was denied. Please allow microphone access in your browser settings and try again.'
        );
      }

      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error(
          'No microphone was found. Please connect a microphone and try again.'
        );
      }

      if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error(
          'Your microphone is currently in use by another application. Please close it and try again.'
        );
      }

      if (err.name === 'OverconstrainedError') {
        throw new Error(
          'Microphone constraints could not be satisfied. Please try a different microphone.'
        );
      }

      throw new Error(
        'Could not start recording. Please check your microphone and try again.'
      );
    }
  }

  public async stop(): Promise<{ blob: Blob; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error('Recording session expired. Please try recording again.'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || AudioRecorder.getSupportedMimeType();

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();

        if (audioBlob.size === 0) {
          reject(
            new Error(
              'No audio was captured. Please speak clearly into the microphone and try again.'
            )
          );
        } else {
          resolve({ blob: audioBlob, mimeType });
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch {
        this.cleanup();
        reject(new Error('Recording stopped unexpectedly. Please try again.'));
      }
    });
  }

  public isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
