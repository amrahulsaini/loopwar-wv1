'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ZonePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check theme and get user info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
      }
      
      // Check if user is authenticated
      const sessionToken = getCookie('sessionToken');
      const savedUsername = getCookie('username');
      
      if (!sessionToken || !savedUsername) {
        // Redirect to join page if not authenticated
        window.location.href = '/join';
        return;
      }
      
      setUsername(savedUsername);
      setIsLoading(false);
    }
  }, []);

  // Cookie utility functions
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const clearSession = () => {
    // Clear cookies
    document.cookie = 'sessionToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'username=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    
    // Clear localStorage
    localStorage.removeItem('username');
    
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <>
      <header className="join-header">
        <div className="container">
          <Link href="/" className="logo" aria-label="LoopWar.dev Home">L</Link>
          <div className="header-actions">
            <button 
              className="theme-switcher" 
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                if (!isDarkMode) {
                  document.body.classList.add('dark-mode');
                  localStorage.setItem('theme', 'dark');
                } else {
                  document.body.classList.remove('dark-mode');
                  localStorage.setItem('theme', 'light');
                }
              }}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              className="logout-btn" 
              onClick={clearSession}
              aria-label="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <main className="verify-main">
        <div className="container">
          {isLoading ? (
            <LoadingSpinner size="large" text="Loading your zone..." />
          ) : (
            <div className="verify-card">
              <div className="card-header">
                <div className="card-icon">🎯</div>
                <h1>Welcome to The Zone!</h1>
                <p>Congratulations! You&apos;ve successfully joined LoopWar.</p>
              </div>

              <div className="success-message">
                {username && (
                  <p>Welcome back, <strong>{username}</strong>! 🚀</p>
                )}
                <p>Your account has been verified and you&apos;re now ready to start your coding journey.</p>
              </div>

              <div className="zone-features">
                <h3>What&apos;s Next?</h3>
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon">🎮</div>
                    <h4>Coding Challenges</h4>
                    <p>Take on AI-powered coding challenges in your preferred language</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">🤖</div>
                    <h4>AI Tutor</h4>
                    <p>Get personalized guidance and hints from your AI coding mentor</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">⚔️</div>
                    <h4>Battle Arena</h4>
                    <p>Compete with other developers in epic coding battles</p>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">📚</div>
                    <h4>Learning Paths</h4>
                    <p>Follow structured learning paths to master new skills</p>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-primary" disabled>
                  Coming Soon - Explore The Zone
                </button>
                <Link href="/" className="btn-secondary">Back to Homepage</Link>
              </div>

              <div className="zone-note">
                <p><strong>Note:</strong> The full Zone experience is currently under development. We&apos;ll notify you when it&apos;s ready!</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
