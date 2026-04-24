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
    const now = Date.now();
    
    // 15 minutes for production, 30 seconds for localhost testing
    const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const REFRACTORY_PERIOD = isDev ? 30000 : 15 * 60 * 1000; 
    
    // 1. Show toast (ALWAYS show the local toast so the site owner knows something is wrong)
    showNotification(errorMsg, 'error');

    // 2. Check persistent storage to prevent Telegram spam
    let shouldSendToTelegram = true;
    try {
      const hash = `${context}_${errorMsg}`.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 60);
      const storageKey = `last_reported_${hash}`;
      const lastSent = localStorage.getItem(storageKey);
      
      if (lastSent && (now - parseInt(lastSent) < REFRACTORY_PERIOD)) {
        console.log(`[Notification] Telegram report suppressed for: ${errorMsg}. (Re-opens in ${Math.round((REFRACTORY_PERIOD - (now - parseInt(lastSent))) / 60000)}m)`);
        shouldSendToTelegram = false;
      } else {
        localStorage.setItem(storageKey, now.toString());
      }
    } catch (e) {
      // Fallback for private browsing
      const lastReported = reportedLogs.current.get(errorMsg);
      if (lastReported && (now - lastReported < REFRACTORY_PERIOD)) shouldSendToTelegram = false;
      reportedLogs.current.set(errorMsg, now);
    }

    if (!shouldSendToTelegram) return;

    // 3. Silent report to Telegram
    try {
      fetch('/api/telegram/error', {
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
    <NotificationContext.Provider value={{ showNotification, reportError, hideNotification }}>
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
