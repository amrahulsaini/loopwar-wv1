'use client';

import { useState, useEffect } from 'react';

interface ThemeSwitcherProps {
  className?: string;
}

export default function ThemeSwitcher({ className = '' }: ThemeSwitcherProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setIsMounted(true);
    
  // Initialize theme from cookie, then localStorage, then system preference
  const cookieMatch = document.cookie.match('(?:^|;)\\s*theme=([^;]+)');
  const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) as 'light' | 'dark' : null;
  const savedTheme = cookieTheme || (localStorage.getItem('theme') as 'light' | 'dark' | null);
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const currentTheme = savedTheme || systemTheme;
    setTheme(currentTheme);

    // Apply theme to document
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    if (newTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', newTheme);
    // Also set cookie for server-side navigation persistence
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));
      document.cookie = `theme=${encodeURIComponent(newTheme)};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
    } catch {
      // ignore cookie setting errors
    }
    setTheme(newTheme);
  };

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
}
