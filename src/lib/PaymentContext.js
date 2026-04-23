'use client';

import { createContext, useContext, useState } from 'react';

// Create the payment context
const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const openPayment = (item) => {
    setActiveItem(item);
    setIsPaymentOpen(true);
  };

  const closePayment = () => {
    setIsPaymentOpen(false);
    setActiveItem(null);
  };

  return (
    <PaymentContext.Provider
      value={{
        activeItem,
        isPaymentOpen,
        openPayment,
        closePayment,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

/**
 * Safe hook to access payment context.
 * Returns the context when available. During server rendering (no provider),
 * returns null instead of throwing to avoid SSR errors.
 */
export const usePayment = () => {
  const context = useContext(PaymentContext);
  // If there is no context (e.g., during server-side rendering), return null safely.
  if (!context) {
    if (typeof window === 'undefined') {
      // Server-side: no provider, return null.
      return null;
    }
    // Client-side without provider: still throw to help developers.
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
