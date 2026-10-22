'use client';

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const STORAGE_KEY = 'theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  // Helper to apply theme class
  const applyTheme = (targetTheme: Theme) => {
    const root = document.documentElement;
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = targetTheme === 'dark' || (targetTheme === 'system' && systemIsDark);

    if (isDark) {
      root.classList.add('dark');
      setResolvedTheme('dark');
    } else {
      root.classList.remove('dark');
      setResolvedTheme('light');
    }
  };

  // Initialize on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const initialTheme: Theme = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    } catch {
      applyTheme('system');
    }
    setMounted(true);
  }, []);

  // Listen to system preference changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    startTransition(() => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // ignore storage errors
      }
      applyTheme(newTheme);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
