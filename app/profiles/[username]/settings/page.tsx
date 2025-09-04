'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Bell, Palette, Globe, Shield } from 'lucide-react';
import Logo from '../../../components/Logo';

export default function SettingsPage({ params }: { params: { username: string } }) {
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionToken = getCookie('sessionToken');
      const savedUsername = getCookie('username');
      
      if (!sessionToken || !savedUsername) {
        window.location.href = '/login';
        return;
      }
      
      // Check if user is accessing their own settings
      if (savedUsername !== params.username) {
        window.location.href = `/profiles/${savedUsername}`;
        return;
      }
      
      setCurrentUser(savedUsername);
      setIsLoading(false);
    }
  }, [params.username]);

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

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const settingsSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: Mail },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'preferences', name: 'Preferences', icon: Globe }
  ];

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="container">
          <div className="header-left">
            <Link href={`/profiles/${currentUser}`} className="back-btn">
              <ArrowLeft size={20} />
              <span>Back to Profile</span>
            </Link>
            <Logo size={40} showText={false} />
            <h1>Settings</h1>
          </div>
        </div>
      </header>

      <main className="settings-main">
        <div className="container">
          <div className="settings-layout">
            {/* Settings Sidebar */}
            <div className="settings-sidebar">
              <h2>Settings</h2>
              <nav className="settings-nav">
                {settingsSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      className={`settings-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <IconComponent size={18} />
                      <span>{section.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {activeSection === 'profile' && (
                <div className="settings-section">
                  <h2>Profile Settings</h2>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" value={currentUser} disabled />
                    <p className="form-hint">Your username cannot be changed</p>
                  </div>
                  <div className="form-group">
                    <label>Display Name</label>
                    <input type="text" placeholder="Enter your display name" />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea placeholder="Tell us about yourself..." rows={4}></textarea>
                  </div>
                  <div className="form-group">
                    <label>Profile Picture</label>
                    <div className="profile-picture-upload">
                      <div className="current-avatar">
                        <div className="avatar-placeholder">{currentUser.charAt(0).toUpperCase()}</div>
                      </div>
                      <button className="upload-btn">Change Picture</button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'account' && (
                <div className="settings-section">
                  <h2>Account Settings</h2>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" placeholder="your@email.com" />
                    <p className="form-hint">We&apos;ll send you important updates here</p>
                  </div>
                  <div className="form-group">
                    <label>Change Password</label>
                    <input type="password" placeholder="Current password" />
                    <input type="password" placeholder="New password" />
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                  <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <button className="danger-btn">Delete Account</button>
                    <p className="form-hint">This action cannot be undone</p>
                  </div>
                </div>
              )}

              {activeSection === 'privacy' && (
                <div className="settings-section">
                  <h2>Privacy Settings</h2>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <h4>Public Profile</h4>
                        <p>Allow others to view your profile and statistics</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                      <div>
                        <h4>Show Activity</h4>
                        <p>Display your coding activity on your profile</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                      <div>
                        <h4>Allow Messages</h4>
                        <p>Let other users send you direct messages</p>
                      </div>
                      <input type="checkbox" />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="settings-section">
                  <h2>Notification Settings</h2>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Receive updates via email</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                      <div>
                        <h4>Contest Reminders</h4>
                        <p>Get notified about upcoming contests</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                      <div>
                        <h4>Achievement Alerts</h4>
                        <p>Celebrate your coding milestones</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="settings-section">
                  <h2>Appearance Settings</h2>
                  <div className="form-group">
                    <label>Theme</label>
                    <select>
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Font Size</label>
                    <select>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              )}

              {activeSection === 'preferences' && (
                <div className="settings-section">
                  <h2>Preferences</h2>
                  <div className="form-group">
                    <label>Preferred Language</label>
                    <select>
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                    </select>
                  </div>
                  <div className="toggle-group">
                    <div className="toggle-item">
                      <div>
                        <h4>Auto-save Code</h4>
                        <p>Automatically save your code solutions</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-item">
                      <div>
                        <h4>Show Hints</h4>
                        <p>Display helpful hints for problems</p>
                      </div>
                      <input type="checkbox" defaultChecked />
                    </div>
                  </div>
                </div>
              )}

              <div className="settings-actions">
                <button className="save-btn">Save Changes</button>
                <button className="cancel-btn">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
