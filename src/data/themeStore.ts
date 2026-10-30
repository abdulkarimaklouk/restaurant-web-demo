import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const STORAGE_KEY_THEME = 'app_theme';
export const DEFAULT_THEME: Theme = 'light';

class ThemeStore {
  private theme: Theme;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.theme = this.readFromStorage();
    this.applyToDOM(this.theme);
  }

  private readFromStorage(): Theme {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_THEME;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_THEME);
      if (raw === 'light' || raw === 'dark') {
        return raw;
      }
    } catch (e) {
      console.error('Failed to parse app_theme from localStorage:', e);
    }

    return DEFAULT_THEME;
  }

  public getTheme(): Theme {
    return this.theme;
  }

  public setTheme(newTheme: Theme): void {
    const validTheme: Theme = newTheme === 'dark' ? 'dark' : 'light';
    this.theme = validTheme;
    this.applyToDOM(validTheme);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY_THEME, validTheme);
      } catch (e) {
        console.error('Failed to persist app_theme to localStorage:', e);
      }
    }

    this.notify();
  }

  public applyToDOM(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  public resetToDefault(): void {
    this.setTheme(DEFAULT_THEME);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error in theme listener:', e);
      }
    });
  }
}

export const themeStore = new ThemeStore();

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
} {
  const [theme, setLocalTheme] = useState<Theme>(() => themeStore.getTheme());

  useEffect(() => {
    const unsubscribe = themeStore.subscribe(() => {
      setLocalTheme(themeStore.getTheme());
    });
    return unsubscribe;
  }, []);

  return {
    theme,
    setTheme: (newTheme: Theme) => themeStore.setTheme(newTheme),
  };
}

