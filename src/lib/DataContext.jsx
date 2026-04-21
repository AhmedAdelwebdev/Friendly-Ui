'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { allItems as fallbackData } from '@/lib/data';
import { useNotification } from './NotificationContext';

const DataContext = createContext({
  items: [],
  loading: false,
  error: null,
  isBackendDown: false,
  refresh: () => {}
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { showNotification, reportError } = useNotification();
  // Initialize with fallbackData immediately for instant UI
  const [items, setItems] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackendDown, setIsBackendDown] = useState(false);

  const loadData = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.status === 503) {
        setIsBackendDown(true);
        showNotification('Database is currently offline. Using offline mode.', 'error');
        throw new Error('Backend is currently offline');
      }
      if (!res.ok) throw new Error('Network error');
      
      const data = await res.json();
      if (data && data.length > 0) {
        setItems(data);
        setError(null);
        setIsBackendDown(false);
      }
    } catch (err) {
      console.warn("DataContext fetch error:", err);
      setError(err.message);
      // If we already know the backend is down, keep the state
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Initial health & configuration check
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        
        if (!res.ok || data.status !== 'healthy') {
          const errorMsg = `Configuration Error (${res.status}): ${data.missing?.join(', ')}`;
          reportError(errorMsg, 'Health Check');
        }
      } catch (err) {
        reportError(`Critical: Health check failed (${err.message})`, 'Startup Check');
      }
    };

    checkHealth();

    // 2. Initial fetch in background (silent)
    loadData(true);

    // Refresh on network recovery
    const handleOnline = () => {
      loadData(false);
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [loadData, reportError]);

  return (
    <DataContext.Provider value={{ items, loading, error, isBackendDown, refresh: () => loadData(false) }}>
      {children}
    </DataContext.Provider>
  );
};
