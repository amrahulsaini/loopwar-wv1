'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import GlobalNotification, { NotificationData } from './GlobalNotification';

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
  hideNotification: () => void;
  currentNotification: NotificationData | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);

  const showNotification = (notification: Omit<NotificationData, 'id'>) => {
    const notificationWithId: NotificationData = {
      ...notification,
      id: Date.now().toString()
    };
    setCurrentNotification(notificationWithId);
  };

  const hideNotification = () => {
    setCurrentNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, currentNotification }}>
      {children}
      <GlobalNotification 
        notification={currentNotification} 
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
}
