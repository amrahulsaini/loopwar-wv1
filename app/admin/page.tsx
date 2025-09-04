'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import Logo from '../components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple admin authentication (for production, use proper auth)
    if (credentials.username === 'loopwar' && credentials.password === 'LOOP@WAR-WV1') {
      // Set admin session
      localStorage.setItem('admin-session', 'true');
      localStorage.setItem('admin-username', credentials.username);
      localStorage.setItem('admin-login-time', new Date().toISOString());
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } else {
      setError('Invalid credentials. Please check your username and password.');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="admin-login-container">
      {/* Header */}
      <header className="admin-login-header">
        <div className="container">
          <div className="header-content">
            <Link href="/" className="logo-link">
              <Logo />
            </Link>
            <Link href="/" className="back-btn">
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-login-main">
        <div className="admin-login-card">
          {/* Admin Icon & Title */}
          <div className="admin-login-header-section">
            <div className="admin-icon">
              <Shield size={32} />
            </div>
            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">
              Secure access to LoopWar administration
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="admin-login-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} />
                <span>Username</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Enter admin username"
                className="form-input"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter admin password"
                  className="form-input password-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !credentials.username || !credentials.password}
              className="admin-login-btn"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="security-notice">
            <div className="security-icon">
              <Lock size={14} />
            </div>
            <p>
              This is a secure admin area. All activities are logged and monitored.
              Unauthorized access attempts will be reported.
            </p>
          </div>
        </div>

        {/* Admin Info Panel */}
        <div className="admin-info-panel">
          <h3>Admin Features</h3>
          <ul>
            <li>✅ Add and manage DSA problems</li>
            <li>✅ Organize problems by categories and topics</li>
            <li>✅ Set problem difficulty levels</li>
            <li>✅ Monitor problem statistics</li>
            <li>✅ Manage subtopic content</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
