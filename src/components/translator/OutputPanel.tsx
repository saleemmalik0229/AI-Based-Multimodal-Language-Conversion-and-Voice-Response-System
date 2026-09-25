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
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/types';

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
  onSpeak: () => void;
  isSpeaking: boolean;
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
  onSpeak,
  isSpeaking,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback copy
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl transition-all duration-200">
      {/* Top Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            Target Language
          </span>
          {/* Target Language Dropdown - Exactly 5 Languages */}
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value as SupportedLanguage)}
            className="bg-slate-950 text-slate-100 font-semibold text-xs border border-slate-700/80 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} className="bg-slate-900 text-slate-100">
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Speech Output Switch */}
          <button
            onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              isVoiceOutputEnabled
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-300'
            }`}
            title="Toggle automatic speech synthesis after translation"
          >
            {isVoiceOutputEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Auto Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Auto Audio Off</span>
              </>
            )}
          </button>

          {translatedText && (
            <button
              onClick={onClear}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Clear output"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Detected Source Language Banner */}
      {detectedLanguage && !error && !isLoading && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-300 flex items-center gap-2 text-xs font-medium">
          <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Detected language: <strong className="text-white font-semibold">{detectedLanguage}</strong></span>
        </div>
      )}

      {/* Main Translation Result Container */}
      <div className="relative flex-1 flex flex-col min-h-[260px]">
        {/* Error State Banner */}
        {error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 my-auto">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-200">Translation Notice</h4>
              <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium animate-pulse">Translating into {targetLanguage}...</span>
          </div>
        ) : translatedText ? (
          /* Output Result Text */
          <div className="flex-1 text-slate-100 font-medium text-lg leading-relaxed whitespace-pre-wrap p-1 select-text">
            {translatedText}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-2 py-12">
            <Globe className="w-8 h-8 text-slate-700 mb-1" />
            <p className="text-sm font-medium text-slate-400">Your translation will appear here</p>
            <p className="text-xs text-slate-600 max-w-xs">
              Select your target language and click Translate to convert text or audio.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
        {/* Audio Playback Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSpeak}
            disabled={!translatedText || isLoading}
            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-semibold ${
              isSpeaking
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
            title="Listen to audio translation"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{isSpeaking ? 'Speaking...' : 'Listen'}</span>
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={!translatedText || isLoading}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

