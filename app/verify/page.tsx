'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

function VerifyPageContent() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isVerified, setIsVerified] = useState(false);
  
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only redirect if user is already verified and has a valid session
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      const isUserVerified = getCookie('isVerified') === 'true';
      
      if (sessionToken && username && isUserVerified) {
        // Redirect to zone only if already verified
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

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setMessage({ 
        type: 'error', 
        text: 'Invalid verification link. Please check your email again.' 
      });
      return;
    }

    if (verificationCode.length !== 6) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter the 6-digit verification code' 
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message 
        });
        setIsVerified(true);
        
        // Set session cookies after successful verification
        if (data.user) {
          setCookie('sessionToken', data.user.sessionToken, 7);
          setCookie('username', data.user.username, 7);
          setCookie('userId', data.user.id, 7);
          setCookie('isVerified', 'true', 7); // Mark user as verified
          setCookie('email', data.user.email, 7);
          setCookie('experienceLevel', data.user.experienceLevel, 7);
          
          // Update localStorage as well
          localStorage.setItem('username', data.user.username);
          localStorage.setItem('isVerified', 'true');
        } else {
          // Fallback to existing cookies
          setCookie('isVerified', 'true', 7);
        }
        
        // Redirect to zone page after successful verification
        setTimeout(() => {
          window.location.href = '/zone';
        }, 3000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Verification failed. Please try again.' 
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  if (!userId) {
    return (
      <>
        <header className="join-header">
          <div className="container">
            <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
              <Logo size={55} showText={false} />
            </Link>
            <div className="header-actions">
            </div>
          </div>
        </header>

        <main className="verify-main">
          <div className="container">
            <div className="verify-card">
              <div className="card-header">
                <div className="card-icon">❌</div>
                <h1>Invalid Verification Link</h1>
                <p>The verification link is invalid or has expired.</p>
              </div>
              <div className="card-actions">
                <Link href="/join" className="btn-primary">Create New Account</Link>
                <Link href="/login" className="btn-secondary">Go to Login</Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="join-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={55} showText={false} />
          </Link>
          <div className="header-actions">
          </div>
        </div>
      </header>

      <main className="verify-main">
        <div className="container">
          <div className="verify-card">
            {!isVerified ? (
              <>
                <div className="card-header">
                  <div className="card-icon">📧</div>
                  <h1>Verify Your Account</h1>
                  <p>We&apos;ve sent a 6-digit verification code to your email address.</p>
                </div>

                {message.text && (
                  <div className={`message ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <form className="verify-form" onSubmit={handleVerification}>
                  <div className="form-group">
                    <label htmlFor="verificationCode" className="form-label">
                      Enter Verification Code
                    </label>
                    <input
                      id="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={handleInputChange}
                      placeholder="000000"
                      className="form-input verification-input"
                      maxLength={6}
                      required
                    />
                    <small className="form-help">
                      Enter the 6-digit code from your email
                    </small>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? (
                      <div className="button-loading">
                        <LoadingSpinner size="small" />
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Verify Account'
                    )}
                  </button>
                </form>

                <div className="verification-help">
                  <p>Didn&apos;t receive the code?</p>
                  <ul>
                    <li>Check your spam/junk folder</li>
                    <li>Make sure the email address is correct</li>
                    <li>Wait a few minutes for the email to arrive</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="verification-success">
                <div className="card-header">
                  <div className="card-icon">✅</div>
                  <h1>Account Verified!</h1>
                  <p>Congratulations! Your LoopWar account has been successfully verified.</p>
                </div>
                
                <div className="success-message">
                  <p>You can now log in and start your coding journey!</p>
                </div>

                <div className="card-actions">
                  <Link href="/login" className="btn-primary">Login to LoopWar</Link>
                  <Link href="/" className="btn-secondary">Go to Homepage</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="verify-main">
        <div className="container">
          <LoadingSpinner size="large" text="Loading verification page..." />
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}
