'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [selectedOption, setSelectedOption] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      const isUserVerified = getCookie('isVerified') === 'true';
      
      if (sessionToken && username && isUserVerified) {
        window.location.href = '/zone';
      }
    }
  }, []);

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

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    if (option === 'google' || option === 'github') {
      // Handle OAuth login
      handleOAuthLogin(option);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    try {
      setLoading(true);
      setError('');
      
      const redirectUrl = `${window.location.origin}/api/auth/oauth?provider=${provider}&action=start`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`Failed to connect with ${provider}. Please try again.`);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Check if user has declined cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'declined') {
      setError('⚠️ Cookies are required for login. Please accept cookies to continue.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Login successful! Redirecting...');
        
        // Set cookies on client-side for immediate availability
        const maxAge = data.rememberMe ? 2592000 : 604800; // 30 days if remember me, 7 days otherwise
        const cookieOptions = `path=/; max-age=${maxAge}; secure; samesite=strict`;
        
        // Clear any existing cookies first
        document.cookie = `sessionToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `isVerified=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        // Set new cookies
        document.cookie = `sessionToken=${data.sessionToken}; ${cookieOptions}`;
        document.cookie = `username=${data.user.username}; ${cookieOptions}`;
        document.cookie = `isVerified=${data.user.isVerified ? 'true' : 'false'}; ${cookieOptions}`;
        
        console.log('🍪 Cookies set:', {
          sessionToken: !!data.sessionToken,
          username: data.user.username,
          isVerified: data.user.isVerified ? 'true' : 'false'
        });
        
        // Small delay to ensure cookies are processed by browser
        setTimeout(() => {
          if (data.user.isVerified) {
            // Normal case: verified user logging in
            console.log('✅ Redirecting verified user to zone');
            window.location.href = '/zone';
          } else {
            // Edge case: user signed up but never verified their email
            console.log('⚠️ User not verified, redirecting to verification');
            window.location.href = `/verify?userId=${data.user.id}&email=${encodeURIComponent(data.user.email)}`;
          }
        }, 500); // Longer delay to ensure cookies are fully processed
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="main-header">
        <div className="container">
          <Logo />
          <div className="nav-actions">
            <Link href="/" className="home-btn" title="Home">
              <Home size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="join-main">
        <div className="container">
          <div className="join-content-wrapper">
            {/* Left Side - Welcome */}
            <div className="join-left">
              <div className="welcome-content">
                <div className="welcome-header">
                  <h1>Welcome Back</h1>
                  <p>Sign in to continue your learning journey with LoopWar</p>
                </div>

                <div className="join-options">
                  <button 
                    className={`join-option-btn ${selectedOption === 'email' ? 'active' : ''}`}
                    onClick={() => handleOptionSelect('email')}
                  >
                    <div className="option-icon">
                      <Logo size={32} showText={false} />
                    </div>
                    <div className="option-content">
                      <h3>Login with LoopWar</h3>
                      <p>Sign in using your email address</p>
                    </div>
                  </button>

                  <button 
                    className={`join-option-btn ${selectedOption === 'google' ? 'active' : ''}`}
                    onClick={() => handleOptionSelect('google')}
                  >
                    <div className="option-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="option-content">
                      <h3>Login with Google</h3>
                      <p>Quick sign in using your Google account</p>
                    </div>
                  </button>

                  <button 
                    className={`join-option-btn ${selectedOption === 'github' ? 'active' : ''}`}
                    onClick={() => handleOptionSelect('github')}
                  >
                    <div className="option-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <div className="option-content">
                      <h3>Login with GitHub</h3>
                      <p>Connect with your developer profile</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className={`join-right ${selectedOption === 'email' ? 'active' : ''}`}>
              <div className="join-card">
                <div className="card-header">
                  <div className="card-icon">🔐</div>
                  <h2>Sign In to LoopWar</h2>
                  <p>Enter your credentials to access your account</p>
                </div>

                {error && (
                  <div className="message error">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="message success">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="join-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="form-checkbox">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Remember me for 30 days
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary login-btn"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>

                  <div className="form-footer">
                    <div className="login-links">
                      <Link href="/forgot-password" className="forgot-link">
                        Forgot your password?
                      </Link>
                    </div>
                    
                    <div className="auth-redirect-right">
                      <p>
                        New to LoopWar? <Link href="/join" className="signin-link">Create an account</Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container">
          <div className="footer-left">
            <p className="copyright">&copy; {new Date().getFullYear()} LoopWar.dev. All Rights Reserved.</p>
          </div>
          <div className="footer-right">
            <ul className="footer-nav">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
