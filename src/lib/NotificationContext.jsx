'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import NotificationToast from '@/components/NotificationToast';

const NotificationContext = createContext({
  showNotification: () => {},
  reportError: () => {}
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const reportedLogs = useRef(new Map());

  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    setNotification({ message, type, duration });
  }, []);

  const reportError = useCallback(async (error, context = 'General') => {
    const errorMsg = typeof error === 'string' ? error : (error?.message || 'Unknown Error');
    
    // Prevent client-side spam: Check if this specific error was reported in last 30s
    const now = Date.now();
    const lastReported = reportedLogs.current.get(errorMsg);
    if (lastReported && (now - lastReported < 30000)) return;
    
    reportedLogs.current.set(errorMsg, now);

    // Show toast
    showNotification(errorMsg, 'error');

    // Silent report to Telegram
    try {
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: errorMsg, 
          context,
          stack: error?.stack 
        })
      });
    } catch (e) {
      console.error('Logging failed', e);
    }
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, reportError }}>
      {children}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};
