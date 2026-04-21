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
    const REFRACTORY_PERIOD = 20 * 60 * 1000; // 20 minutes in milliseconds
    
    // 1. Check persistent storage (localStorage) to prevent spam across refreshes
    try {
      const storageKey = `last_reported_${errorMsg.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
      const lastSent = localStorage.getItem(storageKey);
      
      if (lastSent && (now - parseInt(lastSent) < REFRACTORY_PERIOD)) {
        console.log(`[Notification] Suppression active for: ${errorMsg}. Next report allowed in ${Math.round((REFRACTORY_PERIOD - (now - parseInt(lastSent))) / 60000)}m`);
        return;
      }
      
      localStorage.setItem(storageKey, now.toString());
    } catch (e) {
      // Fallback for private browsing where localStorage might fail
      const lastReported = reportedLogs.current.get(errorMsg);
      if (lastReported && (now - lastReported < REFRACTORY_PERIOD)) return;
      reportedLogs.current.set(errorMsg, now);
    }

    // 2. Show toast (always show the toast so user knows something is wrong locally)
    showNotification(errorMsg, 'error');

    // 3. Silent report to Telegram
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
