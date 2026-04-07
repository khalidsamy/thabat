import React, { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'thabat_theme';
const VALID_THEMES = new Set(['dark', 'light']);

const persistTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and keep the in-memory theme state alive.
  }
};

const applyTheme = (theme) => {
  if (typeof document === 'undefined' || !VALID_THEMES.has(theme)) return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const rootTheme = document.documentElement.dataset.theme;
  if (VALID_THEMES.has(rootTheme)) {
    return rootTheme;
  }

  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (VALID_THEMES.has(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Fall through to system preference.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== THEME_STORAGE_KEY || !VALID_THEMES.has(event.newValue)) return;
      setTheme(event.newValue);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setThemeMode = useCallback((nextTheme) => {
    if (!VALID_THEMES.has(nextTheme)) return;
    startTransition(() => {
      setTheme(nextTheme);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    startTransition(() => {
      setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    });
  }, []);

  const value = useMemo(() => ({
    theme,
    isDark: theme === 'dark',
    setTheme: setThemeMode,
    toggleTheme,
  }), [setThemeMode, theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }

  return context;
};
