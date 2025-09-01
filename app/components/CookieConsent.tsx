'use client';

import { useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if user has already given consent
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      // Show consent after a short delay for better UX
      setTimeout(() => {
        setShowConsent(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    setTimeout(() => setShowConsent(false), 300);

    // Show success notification
    setTimeout(() => {
      showNotification({
        type: 'success',
        title: 'Cookies Accepted',
        message: 'Thank you! Cookies are now enabled. Your session, preferences, and login status will be saved for a better experience.',
        autoClose: 4000
      });
    }, 500);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Clear any existing cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    setIsVisible(false);
    setTimeout(() => setShowConsent(false), 300);

    // Show decline notification
    setTimeout(() => {
      showNotification({
        type: 'warning',
        title: 'Cookies Declined',
        message: 'You have declined cookies. This means we cannot store your session, login status, or preferences. Some features may not work properly without cookies.',
        actions: {
          primary: {
            label: 'Accept Cookies',
            action: () => {
              localStorage.setItem('cookieConsent', 'accepted');
              localStorage.setItem('cookieConsentDate', new Date().toISOString());
              // Reload page to restore functionality
              window.location.reload();
            }
          },
          secondary: {
            label: 'Keep Declined',
            action: () => {
              // User confirmed they want to keep cookies declined
              // Maybe show another notification about limited functionality
            }
          }
        },
        persistent: true
      });
    }, 500);
  };

  if (!showConsent) return null;

  return (
    <div className={`cookie-consent ${isVisible ? 'visible' : ''}`}>
      <div className="cookie-consent-container">
        <div className="cookie-consent-content">
          <div className="cookie-consent-text">
            <div className="cookie-consent-header">
              <div className="cookie-consent-emoji">🍪</div>
              <h3 className="cookie-consent-title">Cookie Consent</h3>
            </div>
            <p className="cookie-consent-description">
              We use cookies to enhance your experience on LoopWar. Cookies help us:
            </p>
            <ul className="cookie-consent-list">
              <li>• Remember your login status and preferences</li>
              <li>• Save your theme selection (dark/light mode)</li>
              <li>• Keep you logged in across sessions</li>
              <li>• Improve our services and user experience</li>
            </ul>
            <p className="cookie-consent-footer">
              By accepting, you agree to our use of cookies. You can change your preferences anytime in your account settings.
            </p>
          </div>
          
          <div className="cookie-consent-buttons">
            <button
              onClick={handleDecline}
              className="cookie-consent-btn cookie-consent-btn-decline"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="cookie-consent-btn cookie-consent-btn-accept"
            >
              Accept Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
