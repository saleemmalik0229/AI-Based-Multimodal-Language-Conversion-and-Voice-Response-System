'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InputPanel } from './InputPanel';
import { OutputPanel } from './OutputPanel';
import { SupportedLanguage } from '@/types';
import { AudioRecorder } from '@/lib/speech/audioRecorder';
import { TTSManager } from '@/lib/speech/tts';

export const TranslatorWorkspace: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('English');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const ttsRef = useRef<TTSManager | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorder();
    ttsRef.current = new TTSManager();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTranslate = async (customText?: string) => {
    const textToTranslate = customText !== undefined ? customText : inputText;
    if (!textToTranslate.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

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

      setTranslatedText(data.translatedText);
      setDetectedLanguage(data.detectedLanguage || null);
    } catch (err: any) {
      setError(err.message || 'Unable to translate right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearInput = () => {
    setInputText('');
    setDetectedLanguage(null);
  };

  const handleClearOutput = () => {
    setTranslatedText('');
    setError(null);
    setDetectedLanguage(null);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleToggleMic = async () => {
    if (!recorderRef.current || isTranscribing) return;

    setError(null);

    if (isRecording) {
      stopTimer();
      setIsRecording(false);
      setIsTranscribing(true);

      try {
        const { blob, mimeType } = await recorderRef.current.stop();

        const formData = new FormData();
        const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
        formData.append('audio', blob, `speech.${extension}`);

        const response = await fetch('/api/speech-to-text', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Speech transcription failed. Please speak clearly and try again.');
        }

        const recognizedText = (data.text || '').trim();
        if (recognizedText) {
          // Immediately update Input panel textarea with recognized transcription text
          setInputText(recognizedText);
          // Pass recognizedText directly to handleTranslate to avoid React state async delay
          await handleTranslate(recognizedText);
        } else {
          setError('No speech recognized in the recording.');
        }
      } catch (err: any) {
        setError(err.message || 'Microphone recording failed. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    } else {
      try {
        const started = await recorderRef.current.start();
        if (started) {
          setIsRecording(true);
          startTimer();
        }
      } catch (err: any) {
        setError(err.message || 'Could not access microphone.');
        setIsRecording(false);
        stopTimer();
      }
    }
  };

  const handleSpeakOutput = () => {
    if (!ttsRef.current || !translatedText) return;

    if (isSpeaking) {
      ttsRef.current.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      ttsRef.current.speak(
        translatedText,
        targetLanguage,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 flex-1">
      {/* Workspace Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            AI Voice & Text Translator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Translate text or voice across English, Telugu, Hindi, Tamil, and Malayalam with automatic language detection.
          </p>
        </div>
      </div>

      {/* Desktop Layout: EXACT 50% LEFT / 50% RIGHT split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch flex-1 min-h-[480px]">
        {/* LEFT 50% INPUT PANEL */}
        <div className="w-full">
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
          />
        </div>

        {/* RIGHT 50% OUTPUT PANEL */}
        <div className="w-full">
          <OutputPanel
            translatedText={translatedText}
            targetLanguage={targetLanguage}
            setTargetLanguage={setTargetLanguage}
            detectedLanguage={detectedLanguage}
            isLoading={isLoading}
            error={error}
            onClear={handleClearOutput}
            isVoiceOutputEnabled={isVoiceOutputEnabled}
            setIsVoiceOutputEnabled={setIsVoiceOutputEnabled}
            onSpeak={handleSpeakOutput}
            isSpeaking={isSpeaking}
          />
        </div>
      </div>
    </div>
  );
};
