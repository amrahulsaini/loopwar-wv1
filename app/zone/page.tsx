'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';

export default function ZonePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check theme and get user info on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      <header className="zone-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={55} showText={false} />
          </Link>
          <nav className="zone-nav">
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-btn ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              Challenges
            </button>
            <button 
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
          </nav>
          <div className="header-actions">
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

      <main className="zone-main">
        <div className="container">
          {isLoading ? (
            <LoadingSpinner size="large" text="Loading your zone..." />
          ) : (
            <>
              {/* Welcome Section */}
              <section className="zone-welcome">
                <div className="welcome-content">
                  <h1>Welcome to The Zone, {username}! 🚀</h1>
                  <p>Your personalized coding battlefield awaits. Ready to level up your skills?</p>
                </div>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-info">
                      <h3>0</h3>
                      <p>Challenges Completed</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <h3>0</h3>
                      <p>Points Earned</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-info">
                      <h3>0</h3>
                      <p>Day Streak</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Tab Content */}
              <section className="zone-content">
                {activeTab === 'dashboard' && (
                  <div className="tab-content">
                    <h2>Dashboard</h2>
                    <div className="dashboard-grid">
                      <div className="feature-card">
                        <div className="card-header">
                          <div className="card-icon">🎮</div>
                          <h3>Quick Challenge</h3>
                        </div>
                        <p>Jump into a coding challenge based on your skill level</p>
                        <button className="btn-primary" disabled>
                          Start Challenge (Coming Soon)
                        </button>
                      </div>
                      
                      <div className="feature-card">
                        <div className="card-header">
                          <div className="card-icon">🤖</div>
                          <h3>AI Tutor</h3>
                        </div>
                        <p>Get personalized help and explanations from AI</p>
                        <button className="btn-primary" disabled>
                          Ask AI (Coming Soon)
                        </button>
                      </div>
                      
                      <div className="feature-card">
                        <div className="card-header">
                          <div className="card-icon">⚔️</div>
                          <h3>Battle Arena</h3>
                        </div>
                        <p>Challenge other developers in real-time coding battles</p>
                        <button className="btn-primary" disabled>
                          Enter Arena (Coming Soon)
                        </button>
                      </div>
                      
                      <div className="feature-card">
                        <div className="card-header">
                          <div className="card-icon">📚</div>
                          <h3>Learning Paths</h3>
                        </div>
                        <p>Follow structured paths to master new technologies</p>
                        <button className="btn-primary" disabled>
                          Browse Paths (Coming Soon)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'challenges' && (
                  <div className="tab-content">
                    <h2>Challenges</h2>
                    <div className="challenges-grid">
                      <div className="challenge-card">
                        <div className="challenge-difficulty easy">Easy</div>
                        <h3>Two Sum</h3>
                        <p>Find two numbers in an array that add up to a target sum</p>
                        <div className="challenge-tags">
                          <span className="tag">Array</span>
                          <span className="tag">Hash Map</span>
                        </div>
                        <button className="btn-secondary" disabled>
                          Solve (Coming Soon)
                        </button>
                      </div>
                      
                      <div className="challenge-card">
                        <div className="challenge-difficulty medium">Medium</div>
                        <h3>Longest Substring</h3>
                        <p>Find the length of the longest substring without repeating characters</p>
                        <div className="challenge-tags">
                          <span className="tag">String</span>
                          <span className="tag">Sliding Window</span>
                        </div>
                        <button className="btn-secondary" disabled>
                          Solve (Coming Soon)
                        </button>
                      </div>
                      
                      <div className="challenge-card">
                        <div className="challenge-difficulty hard">Hard</div>
                        <h3>Merge K Lists</h3>
                        <p>Merge k sorted linked lists and return it as one sorted list</p>
                        <div className="challenge-tags">
                          <span className="tag">Linked List</span>
                          <span className="tag">Divide & Conquer</span>
                        </div>
                        <button className="btn-secondary" disabled>
                          Solve (Coming Soon)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="tab-content">
                    <h2>Profile</h2>
                    <div className="profile-grid">
                      <div className="profile-info">
                        <div className="profile-avatar">
                          <div className="avatar-placeholder">
                            {username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="profile-details">
                          <h3>{username}</h3>
                          <p>Beginner Developer</p>
                          <div className="profile-stats">
                            <div className="stat">
                              <strong>0</strong>
                              <span>Problems Solved</span>
                            </div>
                            <div className="stat">
                              <strong>0</strong>
                              <span>Contests Won</span>
                            </div>
                            <div className="stat">
                              <strong>Member since</strong>
                              <span>Today</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="achievements">
                        <h3>Achievements</h3>
                        <div className="achievement-grid">
                          <div className="achievement locked">
                            <div className="achievement-icon">🏆</div>
                            <h4>First Solve</h4>
                            <p>Complete your first challenge</p>
                          </div>
                          <div className="achievement locked">
                            <div className="achievement-icon">🔥</div>
                            <h4>Streak Master</h4>
                            <p>Maintain a 7-day solving streak</p>
                          </div>
                          <div className="achievement locked">
                            <div className="achievement-icon">⚔️</div>
                            <h4>Battle Victor</h4>
                            <p>Win your first coding battle</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Development Notice */}
              <section className="dev-notice">
                <div className="notice-card">
                  <h3>🚧 Under Development</h3>
                  <p>The Zone is currently being built with amazing features. We&apos;ll notify you when it&apos;s ready!</p>
                  <Link href="/" className="btn-secondary">
                    Back to Homepage
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
