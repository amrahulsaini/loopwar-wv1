'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import NProgress from 'nprogress';

export default function JoinPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    experienceLevel: 'beginner'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // Configure NProgress
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.3,
      easing: 'ease',
      speed: 800
    });
  }, []);

  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is already logged in
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      const isVerified = getCookie('isVerified') === 'true';
      
      if (sessionToken && username && isVerified) {
        // Redirect to zone if fully authenticated and verified
        NProgress.start();
        window.location.href = '/zone';
      } else if (sessionToken && username && !isVerified) {
        // Redirect to verify page if logged in but not verified
        NProgress.start();
        window.location.href = '/verify';
      }
    }
  }, []);

  // Cookie utility functions
  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
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
    
    NProgress.start();

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      NProgress.done();

      if (response.ok) {
        // Store session data
        setCookie('sessionToken', data.sessionToken);
        setCookie('username', data.username);
        setCookie('isVerified', 'false');
        
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Redirecting to verification...' 
        });

        // Redirect to verification page after a short delay
        setTimeout(() => {
          NProgress.start();
          router.push('/verify');
        }, 2000);
      } else {
        // Show specific error message from server
        setMessage({ 
          type: 'error', 
          text: data.error || 'Registration failed. Please try again.' 
        });
      }
    } catch {
      NProgress.done();
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
            <Link 
              href="/" 
              className="home-btn"
              aria-label="Go to Homepage"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
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
                  <h1>Join LoopWar</h1>
                  <p>Choose your preferred way to join the ultimate coding platform and start your journey to becoming an elite developer.</p>
                </div>
                
                <div className="join-options">
                  <button 
                    className={`join-option-btn ${showForm ? 'active' : ''}`}
                    onClick={() => setShowForm(true)}
                  >
                    <span className="option-icon">⚔️</span>
                    <div className="option-content">
                      <h3>Join with LoopWar</h3>
                      <p>Create your account and start your coding journey</p>
                    </div>
                  </button>

                  <button className="join-option-btn" disabled>
                    <span className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </span>
                    <div className="option-content">
                      <h3>Join with Google</h3>
                      <p>Coming Soon - Quick signup with your Google account</p>
                    </div>
                  </button>

                  <button className="join-option-btn" disabled>
                    <span className="option-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </span>
                    <div className="option-content">
                      <h3>Join with GitHub</h3>
                      <p>Coming Soon - Connect with your GitHub profile</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className={`join-right ${showForm ? 'active' : ''}`}>
              <div className="join-card">
                <div className="card-header">
                  <span className="card-icon">⚔️</span>
                  <h2>Join the Battle</h2>
                  <p>Create your LoopWar account and start coding</p>
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <form className="signup-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="beginner">Beginner - New to coding</option>
                      <option value="intermediate">Intermediate - Some experience</option>
                      <option value="advanced">Advanced - Experienced developer</option>
                      <option value="expert">Expert - Senior developer</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary btn-submit gradient-animate"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="small" color="white" text="Creating Account..." />
                    ) : (
                      'Join the War'
                    )}
                  </button>

                  <div className="terms-text">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="terms-link">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="terms-link">Privacy Policy</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
