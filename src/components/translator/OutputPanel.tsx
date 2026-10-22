'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  Loader2,
  AlertCircle,
  Globe,
  Languages,
  Play,
  Pause,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types';
import { TTSPlaybackState } from '@/lib/speech/tts';

interface OutputPanelProps {
  translatedText: string;
  targetLanguage: SupportedLanguage;
  setTargetLanguage: (lang: SupportedLanguage) => void;
  detectedLanguage?: string | null;
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
  isVoiceOutputEnabled: boolean;
  setIsVoiceOutputEnabled: (enabled: boolean) => void;
  onSpeakControl: () => void;
  onStopSpeech: () => void;
  ttsState: TTSPlaybackState;
  isTtsSupported: boolean;
  ttsError: string | null;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  translatedText,
  targetLanguage,
  setTargetLanguage,
  detectedLanguage,
  isLoading,
  error,
  onClear,
  isVoiceOutputEnabled,
  setIsVoiceOutputEnabled,
  onSpeakControl,
  onStopSpeech,
  ttsState,
  isTtsSupported,
  ttsError,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // Playback button config
  const getPlayButtonConfig = () => {
    if (ttsState === 'speaking') {
      return {
        label: 'Pause',
        icon: <Pause className="w-3.5 h-3.5" />,
        className:
          'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-sm',
        title: 'Pause speech',
      };
    }
    if (ttsState === 'paused') {
      return {
        label: 'Resume',
        icon: <Play className="w-3.5 h-3.5 fill-current" />,
        className:
          'bg-amber-600 hover:bg-amber-500 text-white border-amber-600 shadow-sm',
        title: 'Resume speech',
      };
    }
    // idle
    return {
      label: 'Play',
      icon: <Play className="w-3.5 h-3.5 fill-current" />,
      className:
        'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border-[var(--border)] disabled:opacity-40 disabled:cursor-not-allowed',
      title: 'Listen to translation',
    };
  };

  const playConfig = getPlayButtonConfig();
  const canPlay = !!translatedText && !isLoading && isTtsSupported;
  const isActivelyPlaying = ttsState === 'speaking' || ttsState === 'paused';

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm transition-colors duration-150">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-[var(--border)] mb-4">
        {/* Target Language Selector */}
        <div className="flex items-center gap-2.5">
          <label
            htmlFor="target-language-select"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5"
          >
            <Languages className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Target</span>
          </label>
          <select
            id="target-language-select"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
            className="bg-[var(--surface-elevated)] text-[var(--text-primary)] font-semibold text-xs border border-[var(--border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option
                key={lang}
                value={lang}
                className="bg-[var(--surface)] text-[var(--text-primary)]"
              >
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Voice Output Toggle */}
          <button
            type="button"
            onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
            disabled={!isTtsSupported}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              !isTtsSupported
                ? 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)] cursor-not-allowed opacity-60'
                : isVoiceOutputEnabled
                ? 'bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent-subtle)]'
                : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
            title={
              !isTtsSupported
                ? 'Speech synthesis is not supported in this browser'
                : isVoiceOutputEnabled
                ? 'Voice output is ON — click to disable'
                : 'Voice output is OFF — click to enable'
            }
            aria-pressed={isVoiceOutputEnabled}
          >
            {isVoiceOutputEnabled && isTtsSupported ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Voice OFF</span>
              </>
            )}
          </button>

          {translatedText && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border)] transition-colors"
              title="Clear output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="sr-only">Clear output</span>
            </button>
          )}
        </div>
      </div>

      {/* Detected Source Language Banner */}
      {detectedLanguage && !error && !isLoading && (
        <div className="mb-3 px-3.5 py-1.5 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent)]/20 text-[var(--accent)] flex items-center gap-2 text-xs font-medium">
          <Globe className="w-3.5 h-3.5 shrink-0 text-[var(--accent)]" />
          <span>
            Detected language:{' '}
            <strong className="font-semibold text-[var(--text-primary)]">{detectedLanguage}</strong>
          </span>
        </div>
      )}

      {/* Main Translation Content Area */}
      <div className="relative flex-1 flex flex-col min-h-[260px]">
        {error ? (
          <div className="p-4 rounded-xl bg-[var(--error-subtle)] border border-[var(--error)]/20 text-[var(--error)] flex items-start gap-3 my-auto">
            <AlertCircle className="w-5 h-5 text-[var(--error)] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold">Translation Notice</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)] py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            <span className="text-sm font-medium animate-pulse">
              Translating into {targetLanguage}...
            </span>
          </div>
        ) : translatedText ? (
          <div className="flex-1 text-[var(--text-primary)] font-medium text-lg leading-relaxed whitespace-pre-wrap p-1 select-text">
            {translatedText}
            {/* Inline pulse indicator during playback */}
            {ttsState === 'speaking' && (
              <span className="inline-flex items-center gap-1 ml-2 text-[var(--accent)] text-xs font-normal align-middle">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:0.3s]" />
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-muted)] gap-2 py-12">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center text-[var(--text-muted)] mb-1">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Your translation will appear here
            </p>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs">
              Select your target language and click PROCEED to convert text or voice.
            </p>
          </div>
        )}
      </div>

      {/* TTS Unsupported Banner */}
      {!isTtsSupported && (
        <div className="mt-3 flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            Voice playback is not available in this browser. You can still read and copy the translation.
          </p>
        </div>
      )}

      {/* TTS Error Banner */}
      {ttsError && !isLoading && (
        <div className="mt-3 flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-[var(--error-subtle)] border border-[var(--error)]/20 text-[var(--error)] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{ttsError}</p>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 mt-auto">
        {/* Audio Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Play / Pause / Resume */}
          <button
            onClick={onSpeakControl}
            type="button"
            disabled={!canPlay}
            className={`px-3 py-2 rounded-lg border transition-all duration-150 flex items-center gap-2 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${playConfig.className}`}
            title={playConfig.title}
          >
            {playConfig.icon}
            <span>{playConfig.label}</span>
          </button>

          {/* Stop button (visible when playing/paused) */}
          {isActivelyPlaying && (
            <button
              onClick={onStopSpeech}
              type="button"
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Stop playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          )}

          {/* Speaking status label */}
          {ttsState === 'speaking' && (
            <span className="text-xs text-[var(--accent)] font-medium flex items-center gap-1">
              Speaking...
            </span>
          )}
          {ttsState === 'paused' && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Paused
            </span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          type="button"
          disabled={!translatedText || isLoading}
          className={`px-3.5 py-2 border rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
            copied
              ? 'bg-[var(--success-subtle)] border-[var(--success)]/40 text-[var(--success)]'
              : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
          title="Copy translation"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--success)]" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
