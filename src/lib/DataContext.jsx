'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { allItems as fallbackData } from '@/lib/data';

const DataContext = createContext({
  items: [],
  loading: false,
  error: null,
  refresh: () => {}
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  // Initialize with fallbackData immediately for instant UI
  const [items, setItems] = useState(fallbackData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (silent = true) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data && data.length > 0) {
        setItems(data);
        setError(null);
      }
    } catch (err) {
      console.warn("DataContext fetch error:", err);
      setError(err.message);
      // Keep existing items (which are currently fallback or previous real data)
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch in background (silent)
    loadData(true);

    // Refresh on network recovery
    const handleOnline = () => {
      loadData(false);
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [loadData]);

  return (
    <DataContext.Provider value={{ items, loading, error, refresh: () => loadData(false) }}>
      {children}
    </DataContext.Provider>
  );
};
