'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light mode',
      icon: <Sun className="w-3.5 h-3.5" />,
    },
    {
      value: 'system',
      label: 'System preference',
      icon: <Monitor className="w-3.5 h-3.5" />,
    },
    {
      value: 'dark',
      label: 'Dark mode',
      icon: <Moon className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selector"
      className={`inline-flex items-center p-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] ${className}`}
    >
      {options.map((opt) => {
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={isActive}
            title={opt.label}
            className={`p-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-center ${
              isActive
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50'
            }`}
          >
            {opt.icon}
            <span className="sr-only">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
