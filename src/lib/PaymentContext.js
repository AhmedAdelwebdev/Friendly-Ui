'use client';

import { createContext, useContext, useState } from 'react';

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

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
