'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const formRef = useRef<HTMLDivElement>(null);

  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is already logged in and verified
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      const isVerified = getCookie('isVerified') === 'true';
      
      if (sessionToken && username && isVerified) {
        // Redirect to zone if fully authenticated and verified
        window.location.href = '/zone';
      } else if (sessionToken && username && !isVerified) {
        // Redirect to verify page if logged in but not verified
        window.location.href = '/verify';
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

  const handleLoginWithLoopwar = () => {
    setShowForm(true);
    // Scroll to form on mobile devices
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📥 Login response:', { status: response.status, data });

      if (response.ok) {
        console.log('✅ Login successful, processing...');
        setMessage({ 
          type: 'success', 
          text: data.message || 'Login successful!' 
        });
        
        // Store user data
        setCookie('username', data.user.username, formData.rememberMe ? 30 : 7);
        setCookie('userId', data.user.id, formData.rememberMe ? 30 : 7);
        setCookie('sessionToken', data.sessionToken, formData.rememberMe ? 30 : 7);
        setCookie('isVerified', data.user.isVerified ? 'true' : 'false', formData.rememberMe ? 30 : 7);
        
        // Store username in localStorage
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('isVerified', data.user.isVerified ? 'true' : 'false');
        
        console.log('🔗 Redirecting based on verification status...');
        
        // Redirect based on verification status
        setTimeout(() => {
          if (data.user.isVerified) {
            window.location.href = '/zone';
          } else {
            window.location.href = `/verify?userId=${data.user.id}`;
          }
        }, 1500);
      } else {
        console.log('❌ Login failed:', data);
        setMessage({ 
          type: 'error', 
          text: data.error || data.message || 'Login failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = () => {
  // Start GitHub OAuth
  window.location.href = '/api/auth/oauth?provider=github&action=start';
  };

  const handleGoogleLogin = () => {
  // Start Google OAuth
  window.location.href = '/api/auth/oauth?provider=google&action=start';
  };

  return (
    <>
      <header className="join-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={55} showText={false} />
          </Link>
          <div className="header-actions">
            <Link 
              href="/" 
              className="home-btn"
              aria-label="Go to Homepage"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" fill="currentColor"/>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="join-main">
        <div className="container">
          <div className="join-content-wrapper">
            {/* Left Side - Welcome Content */}
            <div className="join-left">
              <div className="welcome-content">
                <div className="welcome-header">
                  <h1>Welcome Back</h1>
                  <p>Choose your preferred way to sign in to LoopWar and continue your coding journey.</p>
                </div>
                
                <div className="join-options">
                  <button 
                    onClick={handleLoginWithLoopwar}
                    className={`join-option-btn ${showForm ? 'active' : ''}`}
                  >
                    <span className="option-icon">⚔️</span>
                    <div className="option-content">
                      <h3>Login with LoopWar</h3>
                      <p>Sign in with your username and password</p>
                    </div>
                  </button>

                  <button 
                    className="join-option-btn" 
                    onClick={handleGitHubLogin}
                  >
                    <span className="option-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </span>
                    <div className="option-content">
                      <h3>Login with GitHub</h3>
                      <p>Quick sign in with your GitHub account</p>
                    </div>
                  </button>

                  <button 
                    className="join-option-btn" 
                    onClick={handleGoogleLogin}
                  >
                    <span className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </span>
                    <div className="option-content">
                      <h3>Login with Google</h3>
                      <p>Sign in securely with Google</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div ref={formRef} className={`join-right ${showForm ? 'active' : ''}`}>
              <div className="join-card">
                <div className="card-header">
                  <span className="card-icon">🔑</span>
                  <h2>Sign In</h2>
                  <p>Welcome back to the battlefield</p>
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <form className="signup-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">
                      <span className="label-icon">👤</span>
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your username"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <span className="label-icon">🔐</span>
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="form-group form-checkbox">
                    <label htmlFor="rememberMe" className="checkbox-label">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Remember me for 30 days
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary btn-submit gradient-animate btn-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="small" color="white" text="Signing in..." />
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="form-footer">
                    <p className="login-links">
                      <Link href="/forgot-password" className="forgot-link">
                        Forgot your password?
                      </Link>
                    </p>
                    <p className="signup-prompt">
                      Don&apos;t have an account?{' '}
                      <Link href="/join" className="signup-link">
                        Join LoopWar
                      </Link>
                    </p>
                  </div>
                </form>
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
