'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';
import { SupportedLanguage } from '@/types';
import { AudioRecorder } from '@/lib/speech/audioRecorder';
import { TTSManager, TTSPlaybackState } from '@/lib/speech/tts';

// Microphone state machine
export type MicState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export const TranslatorWorkspace: React.FC = () => {
  // ─── Core translation state ───────────────────────────────────────────────
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('English');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Voice input state ────────────────────────────────────────────────────
  const [micState, setMicState] = useState<MicState>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [isMicSupported, setIsMicSupported] = useState(true);

  // ─── Voice output state ───────────────────────────────────────────────────
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [ttsState, setTtsState] = useState<TTSPlaybackState>('idle');
  const [isTtsSupported, setIsTtsSupported] = useState(true);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const recorderRef = useRef<AudioRecorder | null>(null);
  const ttsRef = useRef<TTSManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    recorderRef.current = new AudioRecorder();
    ttsRef.current = new TTSManager();

    // Check mic support
    if (typeof window !== 'undefined') {
      setIsMicSupported(!!navigator.mediaDevices?.getUserMedia);
      setIsTtsSupported('speechSynthesis' in window);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      ttsRef.current?.stop();
    };
  }, []);

  // ─── TTS state sync callback ──────────────────────────────────────────────
  const handleTtsStateChange = useCallback((state: TTSPlaybackState) => {
    setTtsState(state);
  }, []);

  // ─── Stop TTS if playing ──────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop();
      setTtsState('idle');
    }
    setTtsError(null);
  }, []);

  // ─── Auto-speak after translation ─────────────────────────────────────────
  const speakTranslation = useCallback(
    (text: string, lang: SupportedLanguage) => {
      if (!ttsRef.current || !text || !isVoiceOutputEnabled) return;
      stopSpeech();

      // Small delay to let browser reset
      setTimeout(() => {
        ttsRef.current?.speak(
          text,
          lang,
          () => setTtsState('idle'),
          (err) => {
            setTtsState('idle');
            setTtsError(err);
          },
          handleTtsStateChange
        );
      }, 100);
    },
    [isVoiceOutputEnabled, stopSpeech, handleTtsStateChange]
  );

  // ─── Translation handler ───────────────────────────────────────────────────
  const handleTranslate = useCallback(
    async (customText?: string) => {
      const textToTranslate = customText !== undefined ? customText : inputText;
      if (!textToTranslate.trim() || isLoading) return;

      // Stop any ongoing speech before starting new translation
      stopSpeech();

      setIsLoading(true);
      setError(null);
      setTtsError(null);

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToTranslate.trim(),
            targetLanguage,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Unable to translate right now. Please try again.');
        }

        const newTranslatedText = data.translatedText;
        const newDetectedLang = data.detectedLanguage || null;

        setTranslatedText(newTranslatedText);
        setDetectedLanguage(newDetectedLang);

        // Auto-speak if voice output is enabled
        if (isVoiceOutputEnabled && newTranslatedText) {
          speakTranslation(newTranslatedText, targetLanguage);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to translate right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, targetLanguage, isVoiceOutputEnabled, stopSpeech, speakTranslation]
  );

  // ─── Recording timer ───────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  // ─── Mic toggle handler ────────────────────────────────────────────────────
  const handleToggleMic = useCallback(async () => {
    if (!recorderRef.current) return;
    if (micState === 'processing') return; // Ignore during processing

    setMicError(null);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
    }

    // Stop any playing speech when starting to record
    if (micState === 'idle' || micState === 'success' || micState === 'error') {
      stopSpeech();
      try {
        const started = await recorderRef.current.start();
        if (started) {
          setMicState('recording');
          startTimer();
        }
      } catch (err: any) {
        setMicError(err.message || 'Could not access microphone.');
        setMicState('error');
        stopTimer();
      }
      return;
    }

    // Stop recording → transcribe → translate
    if (micState === 'recording') {
      stopTimer();
      setMicState('processing');

      try {
        const { blob, mimeType } = await recorderRef.current.stop();

        const formData = new FormData();
        const extension = mimeType.includes('mp4')
          ? 'mp4'
          : mimeType.includes('ogg')
          ? 'ogg'
          : 'webm';
        formData.append('audio', blob, `speech.${extension}`);

        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || 'Could not understand speech. Please speak clearly and try again.'
          );
        }

        const recognizedText = (data.text || '').trim();
        if (!recognizedText) {
          throw new Error('No speech was detected. Please try speaking again.');
        }

        // Show success state briefly
        setMicState('success');
        setInputText(recognizedText);

        // Auto-translate immediately
        await handleTranslate(recognizedText);

        // Reset back to idle after short delay
        successTimerRef.current = setTimeout(() => {
          setMicState('idle');
        }, 2000);
      } catch (err: any) {
        setMicError(err.message || 'Voice processing failed. Please try again.');
        setMicState('error');
      }
    }
  }, [micState, stopSpeech, startTimer, stopTimer, handleTranslate]);

  // ─── Manual speak / pause / resume / stop ────────────────────────────────
  const handleSpeakControl = useCallback(() => {
    if (!ttsRef.current || !translatedText) return;

    if (ttsState === 'speaking') {
      ttsRef.current.pause();
      setTtsState('paused');
    } else if (ttsState === 'paused') {
      ttsRef.current.resume();
      setTtsState('speaking');
    } else {
      // idle → speak
      setTtsError(null);
      ttsRef.current.speak(
        translatedText,
        targetLanguage,
        () => setTtsState('idle'),
        (err) => {
          setTtsState('idle');
          setTtsError(err);
        },
        handleTtsStateChange
      );
    }
  }, [ttsState, translatedText, targetLanguage, handleTtsStateChange]);

  const handleStopSpeech = useCallback(() => {
    stopSpeech();
  }, [stopSpeech]);

  // ─── Clear handlers ───────────────────────────────────────────────────────
  const handleClearInput = useCallback(() => {
    setInputText('');
    setDetectedLanguage(null);
    setMicError(null);
    if (micState !== 'recording' && micState !== 'processing') {
      setMicState('idle');
    }
  }, [micState]);

  const handleClearOutput = useCallback(() => {
    stopSpeech();
    setTranslatedText('');
    setError(null);
    setTtsError(null);
    setDetectedLanguage(null);
  }, [stopSpeech]);

  const handleClearAll = useCallback(() => {
    stopSpeech();
    setInputText('');
    setTranslatedText('');
    setError(null);
    setTtsError(null);
    setDetectedLanguage(null);
    setMicError(null);
    if (micState !== 'recording' && micState !== 'processing') {
      setMicState('idle');
    }
  }, [stopSpeech, micState]);

  // ─── Voice output toggle ──────────────────────────────────────────────────
  const handleVoiceOutputToggle = useCallback(
    (enabled: boolean) => {
      setIsVoiceOutputEnabled(enabled);
      if (!enabled) {
        stopSpeech();
      }
    },
    [stopSpeech]
  );

  // Derived convenience booleans for child panels
  const isRecording = micState === 'recording';
  const isTranscribing = micState === 'processing';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6 flex-1 transition-colors duration-150">
      {/* Workspace Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--surface)] p-4 sm:p-5 rounded-xl border border-[var(--border)] shadow-sm transition-colors duration-150">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            AI Voice &amp; Text Translator
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Translate text or voice across English, Telugu, Hindi, Tamil, and Malayalam with automatic language detection.
          </p>
        </div>
        {/* Quick Reset */}
        {(inputText || translatedText) && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-all flex items-center gap-1.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            title="Reset all inputs and outputs"
          >
            <span>↺</span>
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Desktop Layout: EXACT 50% LEFT / 50% RIGHT split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1 min-h-[500px]">
        {/* LEFT 50% INPUT PANEL */}
        <div className="w-full h-full">
          <InputPanel
            inputText={inputText}
            setInputText={setInputText}
            onTranslate={() => handleTranslate()}
            onClear={handleClearInput}
            isLoading={isLoading}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            recordingSeconds={recordingSeconds}
            onToggleMic={handleToggleMic}
            detectedLanguage={detectedLanguage}
            micState={micState}
            micError={micError}
            isMicSupported={isMicSupported}
          />
        </div>

        {/* RIGHT 50% OUTPUT PANEL */}
        <div className="w-full h-full">
          <OutputPanel
            translatedText={translatedText}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            detectedLanguage={detectedLanguage}
            isLoading={isLoading}
            error={error}
            onClear={handleClearOutput}
            isVoiceOutputEnabled={isVoiceOutputEnabled}
            setIsVoiceOutputEnabled={handleVoiceOutputToggle}
            onSpeakControl={handleSpeakControl}
            onStopSpeech={handleStopSpeech}
            ttsState={ttsState}
            isTtsSupported={isTtsSupported}
            ttsError={ttsError}
          />
        </div>
      </div>
    </div>
  );
};
