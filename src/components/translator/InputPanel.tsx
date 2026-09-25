'use client';

import React from 'react';
import { Mic, MicOff, RotateCcw, ArrowRight, Loader2 } from 'lucide-react';

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
}) => {
  const maxLength = 5000;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      {/* Top Bar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-slate-200 text-sm tracking-wide">
            Input
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60 rounded-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {detectedLanguage ? `Detected: ${detectedLanguage}` : 'Source language detected automatically'}
          </span>
        </div>

        {inputText && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Clear input"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Main Text Input Area */}
      <div className="relative flex-1 flex flex-col min-h-[260px]">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value.slice(0, maxLength))}
          placeholder="Type your message or record your voice..."
          className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none font-normal text-base leading-relaxed p-1 border-none focus:ring-0"
        />

        {/* Audio Recording Active State Indicator */}
        {isRecording && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono px-3 py-1.5 rounded-lg shadow-md">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Recording... ({formatTime(recordingSeconds)})
          </div>
        )}

        {/* Transcribing State Indicator */}
        {isTranscribing && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3 py-1.5 rounded-lg shadow-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            Transcribing audio...
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          {/* Microphone Recording Button */}
          <button
            onClick={onToggleMic}
            type="button"
            disabled={isTranscribing}
            className={`px-3.5 py-2 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 text-xs font-semibold ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-600/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 disabled:opacity-50'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-blue-400" />
                <span>Record Voice</span>
              </>
            )}
          </button>

          {/* Character Count */}
          <span className="text-xs text-slate-500 font-mono">
            {inputText.length} / {maxLength}
          </span>
        </div>

        {/* PROCEED / Translate Button */}
        <button
          onClick={onTranslate}
          disabled={isLoading || isTranscribing || !inputText.trim()}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
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
