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
  const { reportError } = useNotification();
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
        reportError('Database Offline: Site is running on fallback data.', 'Inventory Sync');
        throw new Error('Backend is currently offline');
      }
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      
      const data = await res.json();
      if (data && data.length > 0) {
        setItems(data);
        setError(null);
        setIsBackendDown(false);
      }
    } catch (err) {
      console.warn("DataContext fetch error:", err);
      setError(err.message);
      setIsBackendDown(true); // BLOCK PURCHASES 
      // Only report if it's not a 503 (since 503 is reported above)
      if (err.message !== 'Backend is currently offline') {
        reportError(`Inventory Fetch Failed: ${err.message}. Using default products.`, 'Inventory Sync');
      }
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
          setIsBackendDown(true); // BLOCK PURCHASES
          const errorMsg = `Configuration Error (${res.status}): ${data.missing?.join(', ')}`;
          reportError(errorMsg, 'Health Check');
        } else {
          setIsBackendDown(false);
        }
      } catch (err) {
        setIsBackendDown(true); // BLOCK PURCHASES
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
