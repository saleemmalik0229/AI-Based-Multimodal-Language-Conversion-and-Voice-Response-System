/**
 * Browser MediaRecorder audio recording helper module.
 * Dynamically detects browser supported audio MIME types.
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

  public async start(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone recording is not supported in this browser.');
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
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access.');
      }
      throw new Error('Failed to start audio recording. Please check your microphone.');
    }
  }

  public async stop(): Promise<{ blob: Blob; mimeType: string }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        reject(new Error('Audio recorder is not active.'));
        return;
      }

      const mimeType = this.mediaRecorder.mimeType || AudioRecorder.getSupportedMimeType();

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();

        if (audioBlob.size === 0) {
          reject(new Error('Recorded audio is empty. Please speak clearly into the microphone.'));
        } else {
          resolve({ blob: audioBlob, mimeType });
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (err: any) {
        this.cleanup();
        reject(new Error('Error stopping audio recorder: ' + err.message));
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
