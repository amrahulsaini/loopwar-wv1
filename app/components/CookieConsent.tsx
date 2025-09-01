'use client';

import { useState, useEffect } from 'react';

interface CookieConsentProps {
  isDarkMode?: boolean;
}

export default function CookieConsent({ isDarkMode = false }: CookieConsentProps) {
  const [showConsent, setShowConsent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
  };

  if (!showConsent) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className={`p-6 mx-4 mb-4 rounded-lg shadow-lg border-2 backdrop-blur-sm ${
        isDarkMode 
          ? 'bg-gray-900/95 border-gray-700 text-white' 
          : 'bg-white/95 border-gray-200 text-gray-900'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🍪</div>
                <h3 className="text-lg font-semibold">Cookie Consent</h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                We use cookies to enhance your experience on LoopWar. Cookies help us:
              </p>
              <ul className={`text-sm mt-2 space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Remember your login status and preferences</li>
                <li>• Save your theme selection (dark/light mode)</li>
                <li>• Keep you logged in across sessions</li>
                <li>• Improve our services and user experience</li>
              </ul>
              <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                By accepting, you agree to our use of cookies. You can change your preferences anytime in your account settings.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
              <button
                onClick={handleDecline}
                className={`px-6 py-2 rounded-lg border-2 font-medium transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-800'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Accept Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
