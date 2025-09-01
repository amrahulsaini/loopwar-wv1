'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JoinPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    experienceLevel: 'beginner'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check theme and existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.body.classList.add('dark-mode');
      }
      
      // Check if user is already logged in
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      if (sessionToken && username) {
        // Redirect to zone if already authenticated
        window.location.href = '/zone';
      }
    }
  }, []);

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        
        // Set session cookies (but not isVerified - requires verification first)
        setCookie('sessionToken', data.sessionToken, 7);
        setCookie('username', formData.username, 7);
        setCookie('userId', data.userId, 7);
        setCookie('isVerified', 'false', 7); // Explicitly set as not verified
        
        // Store username in localStorage for the zone page
        localStorage.setItem('username', formData.username);
        
        // Redirect to verify page after successful registration
        setTimeout(() => {
          window.location.href = `/verify?userId=${data.userId}`;
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Registration failed. Please try again.' 
        });
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
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
          </div>
        </div>
      </header>

      <main className="join-main">
        <div className="container">
          <div className="join-hero">
            <h1>Join the War</h1>
            <p>Ready to level up your coding skills? Join thousands of developers in the ultimate AI-powered learning experience.</p>
          </div>

          <div className="join-card">
            <div className="card-header">
              <h2>Create Your Account</h2>
              <p>Start your coding journey today</p>
            </div>

            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Choose a unique username"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experienceLevel" className="form-label">Experience Level</label>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="beginner">Beginner - Just starting out</option>
                  <option value="intermediate">Intermediate - Some coding experience</option>
                  <option value="advanced">Advanced - Experienced developer</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="button-loading">
                    <LoadingSpinner size="small" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Join LoopWar'
                )}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="social-signup">
              <button className="social-btn google-btn" disabled>
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Join with Google
              </button>
              
              <button className="social-btn github-btn" disabled>
                <svg className="social-icon" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Join with GitHub
              </button>
            </div>
          </div>

          <div className="benefits-section">
            <h3>Why Choose LoopWar?</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">🤖</div>
                <h4>AI-Powered Learning</h4>
                <p>Get personalized guidance and instant feedback from our advanced AI tutor</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚔️</div>
                <h4>Competitive Battles</h4>
                <p>Challenge other developers in epic coding battles and climb the leaderboard</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <h4>Structured Paths</h4>
                <p>Follow carefully crafted learning paths designed by industry experts</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🚀</div>
                <h4>Real Projects</h4>
                <p>Build real-world projects that you can add to your portfolio</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="join-footer">
        <div className="container">
          <p>&copy; 2024 LoopWar.dev. All rights reserved.</p>
          <div className="footer-links">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
