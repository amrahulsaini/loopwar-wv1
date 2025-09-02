'use client';

import { useTheme } from '../contexts/ThemeContext';

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  try {
    const { theme, toggleTheme, mounted } = useTheme();

    // Don't render anything during SSR to prevent hydration mismatch
    if (!mounted) {
      return null;
    }

    return (
      <button 
        className={`theme-switcher ${className}`}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    );
  } catch (error) {
    // Fallback when ThemeProvider is not available - also don't render during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      <button 
        className={`theme-switcher ${className}`}
        onClick={() => {
          // Simple fallback theme toggle
          const isDark = document.body.classList.contains('dark-mode');
          if (isDark) {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
          } else {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
          }
        }}
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
      >
        🌙
      </button>
    );
  }
}
