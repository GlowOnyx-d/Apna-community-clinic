import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy auto-saved theme key from previous visits
        localStorage.removeItem('Apna_theme_preference');
      } catch {}

      // Only activate dark mode if the user manually clicked and chose dark mode
      const manual = localStorage.getItem('Apna_manual_theme');
      if (manual === 'dark') {
        return 'dark';
      }
    }
    // Always default to light mode (never auto-switch based on OS preference)
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('Apna_manual_theme', next);
      } catch (e) {
        console.warn('Could not save manual theme preference:', e);
      }
      return next;
    });
  };

  const setThemeExplicit = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('Apna_manual_theme', newTheme);
    } catch (e) {
      console.warn('Could not save manual theme preference:', e);
    }
  };

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: setThemeExplicit
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
