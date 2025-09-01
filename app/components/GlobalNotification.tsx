'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actions?: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
  autoClose?: number; // milliseconds, 0 for no auto close
  persistent?: boolean; // if true, won't auto close
}

interface GlobalNotificationProps {
  notification: NotificationData | null;
  onClose: () => void;
}

export default function GlobalNotification({ notification, onClose }: GlobalNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (notification) {
      setIsAnimating(true);
      setTimeout(() => setIsVisible(true), 100);
      
      // Auto close if specified
      if (notification.autoClose && notification.autoClose > 0 && !notification.persistent) {
        const timer = setTimeout(() => {
          handleClose();
        }, notification.autoClose);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [notification, handleClose]);

  if (!notification || !isAnimating) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`global-notification global-notification-${notification.type} ${isVisible ? 'visible' : ''}`}>
      <div className="global-notification-container">
        <div className="global-notification-content">
          <div className="global-notification-main">
            <div className="global-notification-header">
              <div className="global-notification-icon">{getIcon()}</div>
              <h4 className="global-notification-title">{notification.title}</h4>
              <button 
                onClick={handleClose}
                className="global-notification-close"
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
            <p className="global-notification-message">{notification.message}</p>
          </div>
          
          {notification.actions && (
            <div className="global-notification-actions">
              {notification.actions.secondary && (
                <button
                  onClick={() => {
                    notification.actions!.secondary!.action();
                    handleClose();
                  }}
                  className="global-notification-btn global-notification-btn-secondary"
                >
                  {notification.actions.secondary.label}
                </button>
              )}
              {notification.actions.primary && (
                <button
                  onClick={() => {
                    notification.actions!.primary!.action();
                    handleClose();
                  }}
                  className="global-notification-btn global-notification-btn-primary"
                >
                  {notification.actions.primary.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
