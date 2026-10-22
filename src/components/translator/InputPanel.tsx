'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { MicState } from './TranslatorWorkspace';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onTranslate: () => void;
  onClear: () => void;
  isLoading: boolean;
  isRecording: boolean;
  isTranscribing: boolean;
  recordingSeconds: number;
  onToggleMic: () => void;
  detectedLanguage?: string | null;
  micState: MicState;
  micError: string | null;
  isMicSupported: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  onTranslate,
  onClear,
  isLoading,
  isRecording,
  isTranscribing,
  recordingSeconds,
  onToggleMic,
  detectedLanguage,
  micState,
  micError,
  isMicSupported,
}) => {
  const maxLength = 5000;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Mic button config for each state
  const getMicConfig = () => {
    if (!isMicSupported) {
      return {
        label: 'Voice Unsupported',
        icon: <MicOff className="w-3.5 h-3.5 text-[var(--text-muted)]" />,
        className:
          'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)] cursor-not-allowed opacity-60',
        disabled: true,
        title: 'Microphone is not supported in this browser.',
      };
    }

    switch (micState) {
      case 'recording':
        return {
          label: 'Stop Recording',
          icon: <MicOff className="w-3.5 h-3.5" />,
          className:
            'bg-[var(--error)] hover:opacity-90 text-white border-[var(--error)] shadow-sm animate-pulse',
          disabled: false,
          title: 'Click to stop recording',
        };
      case 'processing':
        return {
          label: 'Converting...',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          className:
            'bg-[var(--accent)] text-white border-[var(--accent)] cursor-wait opacity-85',
          disabled: true,
          title: 'Converting speech to text...',
        };
      case 'success':
        return {
          label: 'Voice Captured',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />,
          className:
            'bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/40',
          disabled: false,
          title: 'Voice captured — click to record again',
        };
      case 'error':
        return {
          label: 'Try Again',
          icon: <Mic className="w-3.5 h-3.5 text-[var(--error)]" />,
          className:
            'bg-[var(--error-subtle)] hover:opacity-90 text-[var(--error)] border-[var(--error)]/40',
          disabled: false,
          title: 'Recording failed — click to try again',
        };
      default: // idle
        return {
          label: 'Record Voice',
          icon: <Mic className="w-3.5 h-3.5 text-[var(--accent)]" />,
          className:
            'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--border)]',
          disabled: false,
          title: 'Click to start voice recording',
        };
    }
  };

  const micConfig = getMicConfig();

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm transition-colors duration-150">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border)] mb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-semibold text-[var(--text-primary)] text-sm tracking-tight">
            Input
          </span>
          <span
            className={`px-2.5 py-0.5 text-[11px] font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
              detectedLanguage
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/20'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                detectedLanguage ? 'bg-[var(--accent)]' : 'bg-[var(--text-muted)]'
              }`}
            />
            {detectedLanguage
              ? `Detected: ${detectedLanguage}`
              : 'Source language detected automatically'}
          </span>
        </div>

        {inputText && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border)] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
            title="Clear input text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Browser Unsupported Banner */}
      {!isMicSupported && (
        <div className="mb-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            Voice input is not supported in this browser. You can still type your text below.
          </p>
        </div>
      )}

      {/* Main Text Input Area */}
      <div className="relative flex-1 flex flex-col min-h-[260px]">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, maxLength))}
          placeholder={
            isMicSupported
              ? 'Type your message or click "Record Voice" to speak...'
              : 'Type your message here...'
          }
          className="w-full flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none outline-none font-normal text-base leading-relaxed p-1 border-none focus:ring-0"
          aria-label="Source text to translate"
        />

        {/* Recording Active Indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-[var(--error-subtle)] border border-[var(--error)]/30 text-[var(--error)] text-xs font-mono px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
            <Radio className="w-3.5 h-3.5 text-[var(--error)] animate-pulse" />
            <span>Listening... ({formatTime(recordingSeconds)})</span>
          </div>
        )}

        {/* Transcribing Indicator */}
        {isTranscribing && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-[var(--accent)] text-xs px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
            <span>Converting speech...</span>
          </div>
        )}
      </div>

      {/* Mic Error Banner */}
      {micError && micState === 'error' && (
        <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-[var(--error-subtle)] border border-[var(--error)]/20 text-[var(--error)] text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{micError}</p>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-3">
          {/* Microphone Button */}
          <button
            onClick={onToggleMic}
            type="button"
            disabled={micConfig.disabled || isLoading}
            className={`px-3.5 py-2 rounded-lg border transition-all duration-150 flex items-center justify-center gap-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${micConfig.className}`}
            title={micConfig.title}
          >
            {micConfig.icon}
            <span>{micConfig.label}</span>
          </button>

          {/* Character Count */}
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {inputText.length} / {maxLength}
          </span>
        </div>

        {/* PROCEED / Translate Button */}
        <button
          onClick={onTranslate}
          type="button"
          disabled={isLoading || isTranscribing || !inputText.trim()}
          className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <span>PROCEED</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
