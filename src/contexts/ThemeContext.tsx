'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // ✅ FIX: Default to 'light' instead of 'dark'
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('primejar-theme') as Theme | null;

    if (saved === 'dark' || saved === 'light') {
      setTheme(saved);
      applyTheme(saved);
    } else {
      // ✅ FIX: Default to light if no preference saved
      setTheme('light');
      applyTheme('light');
      localStorage.setItem('primejar-theme', 'light');
    }
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      // ✅ FIX: Explicitly REMOVE dark class (was missing before)
      root.classList.remove('dark');
    }
  }

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('primejar-theme', newTheme);
    applyTheme(newTheme);
  };

  // Prevent flash: render children immediately (theme handled by inline script in layout.tsx)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
