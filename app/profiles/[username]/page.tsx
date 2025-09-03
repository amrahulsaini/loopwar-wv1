'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Logo from '../../components/Logo';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [isLoading, setIsLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Define types for user data
  interface Achievement {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
  }

  interface Activity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }

  // Mock user data - in real app, this would come from API
  const userData = {
    username: username,
    joinedDate: 'September 2025',
    problemsSolved: 0,
    contestsWon: 0,
    currentStreak: 0,
    longestStreak: 0,
    rank: 'Beginner',
    totalPoints: 0,
    skills: [] as string[],
    achievements: [] as Achievement[],
    recentActivity: [] as Activity[]
  };

  // Cookie utility function
  const getCookie = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUsername = getCookie('username');
      
      setCurrentUser(savedUsername);
      setIsOwnProfile(savedUsername === username);
      
      // Simulate API call to check if user exists
      setTimeout(() => {
        // For now, we'll assume any username exists (in real app, check with backend)
        setUserExists(true);
        setIsLoading(false);
      }, 1000);
    }
  }, [username]);

  if (isLoading) {
    return (
      <div className="profile-loading">
        <LoadingSpinner size="large" text={`Loading ${username}'s profile...`} />
      </div>
    );
  }

  if (!userExists) {
    return (
      <div className="profile-not-found">
        <div className="container">
          <div className="not-found-content">
            <h1>User Not Found</h1>
            <p>The user &quot;{username}&quot; doesn&apos;t exist or their profile is private.</p>
            <Link href="/zone" className="btn-primary">
              Back to Zone
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="profile-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={55} showText={true} />
          </Link>
          <nav className="profile-nav">
            <Link href="/zone" className="nav-link">
              Back to Zone
            </Link>
            {currentUser && (
              <Link href={`/profiles/${currentUser}`} className="nav-link">
                My Profile
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="container">
          {/* Profile Hero Section */}
          <section className="profile-hero">
            <div className="profile-hero-content">
              <div className="profile-avatar-large">
                <Image 
                  src="/default-pfp.svg" 
                  alt={`${username}'s profile`}
                  width={120}
                  height={120}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = username.charAt(0).toUpperCase();
                      parent.classList.add('default-avatar-large');
                    }
                  }}
                />
              </div>
              <div className="profile-info">
                <h1>{username}</h1>
                <p className="profile-rank">{userData.rank} Developer</p>
                <p className="profile-joined">Member since {userData.joinedDate}</p>
                {isOwnProfile && (
                  <Link href={`/profiles/${username}/settings`} className="edit-profile-btn">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="profile-stats-section">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💻</div>
                <div className="stat-info">
                  <h3>{userData.problemsSolved}</h3>
                  <p>Problems Solved</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-info">
                  <h3>{userData.contestsWon}</h3>
                  <p>Contests Won</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-info">
                  <h3>{userData.currentStreak}</h3>
                  <p>Current Streak</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-info">
                  <h3>{userData.totalPoints}</h3>
                  <p>Total Points</p>
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="profile-content-grid">
            {/* Achievements */}
            <section className="achievements-section">
              <h2>Achievements</h2>
              <div className="achievements-grid">
                <div className="achievement-card locked">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-info">
                    <h4>First Solve</h4>
                    <p>Complete your first coding challenge</p>
                    <span className="achievement-status">Locked</span>
                  </div>
                </div>
                <div className="achievement-card locked">
                  <div className="achievement-icon">🔥</div>
                  <div className="achievement-info">
                    <h4>Streak Master</h4>
                    <p>Maintain a 7-day solving streak</p>
                    <span className="achievement-status">Locked</span>
                  </div>
                </div>
                <div className="achievement-card locked">
                  <div className="achievement-icon">⚔️</div>
                  <div className="achievement-info">
                    <h4>Battle Victor</h4>
                    <p>Win your first coding battle</p>
                    <span className="achievement-status">Locked</span>
                  </div>
                </div>
                <div className="achievement-card locked">
                  <div className="achievement-icon">📚</div>
                  <div className="achievement-info">
                    <h4>Knowledge Seeker</h4>
                    <p>Complete 10 problems in different categories</p>
                    <span className="achievement-status">Locked</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="activity-section">
              <h2>Recent Activity</h2>
              <div className="activity-feed">
                <div className="activity-placeholder">
                  <p>No recent activity yet.</p>
                  <p>Start solving problems to see your progress here!</p>
                  {isOwnProfile && (
                    <Link href="/zone" className="btn-secondary">
                      Start Coding
                    </Link>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Skills Section */}
          <section className="skills-section">
            <h2>Skills & Categories</h2>
            <div className="skills-grid">
              <div className="skill-category">
                <h3>🧠 Core DSA</h3>
                <div className="skill-progress">
                  <div className="skill-bar">
                    <div className="skill-fill" style={{width: '0%'}}></div>
                  </div>
                  <span>0/15 topics</span>
                </div>
              </div>
              <div className="skill-category">
                <h3>🗃️ Databases</h3>
                <div className="skill-progress">
                  <div className="skill-bar">
                    <div className="skill-fill" style={{width: '0%'}}></div>
                  </div>
                  <span>0/5 topics</span>
                </div>
              </div>
              <div className="skill-category">
                <h3>🌐 Networking</h3>
                <div className="skill-progress">
                  <div className="skill-bar">
                    <div className="skill-fill" style={{width: '0%'}}></div>
                  </div>
                  <span>0/5 topics</span>
                </div>
              </div>
              <div className="skill-category">
                <h3>🤖 AI & ML</h3>
                <div className="skill-progress">
                  <div className="skill-bar">
                    <div className="skill-fill" style={{width: '0%'}}></div>
                  </div>
                  <span>0/5 topics</span>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          {!isOwnProfile && (
            <section className="profile-cta">
              <div className="cta-card">
                <h3>Ready to challenge yourself?</h3>
                <p>Join {username} in the coding arena and start your journey!</p>
                <Link href="/join" className="btn-primary">
                  Join LoopWar
                </Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
