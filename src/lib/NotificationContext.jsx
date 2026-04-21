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
    const storageKey = `error_log_${context}_${errorMsg.replace(/\s+/g, '_')}`;
    
    // Prevent spam using localStorage (sustains between refreshes)
    const now = Date.now();
    const lastReported = localStorage.getItem(storageKey);
    const TWENTY_MINUTES = 20 * 60 * 1000;

    if (lastReported && (now - parseInt(lastReported) < TWENTY_MINUTES)) {
      console.log(`[Throttled] Error already reported in last 20m: ${errorMsg}`);
      return;
    }
    
    localStorage.setItem(storageKey, now.toString());

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
  }, []);

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
