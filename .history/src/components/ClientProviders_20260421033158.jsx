'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { OrdersProvider } from "@/lib/CartContext";
import { PaymentProvider } from "@/lib/PaymentContext";
import { DataProvider } from "@/lib/DataContext";
import { NotificationProvider, useNotification } from "@/lib/NotificationContext";
import Script from 'next/script';
import { useEffect } from "react";

const PAYPAL_CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();

if (!PAYPAL_CLIENT_ID) {
  console.warn("PayPal Client ID is missing. PayPal functionality will be disabled.");
}

function GlobalErrorHandler({ children }) {
  const { reportError } = useNotification();

  useEffect(() => {
    const handleError = (event) => {
      reportError(event.error || event.message, 'Browser Runtime');
    };

    const handleRejection = (event) => {
      reportError(event.reason || 'Unhandled Promise Rejection', 'Browser Promise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [reportError]);

  return children;
}

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <GlobalErrorHandler>
          <DataProvider>
            <OrdersProvider>
              <PaymentProvider>
              <PayPalScriptProvider options={{ 
                "client-id": PAYPAL_CLIENT_ID || "sb", // fallback for build
                currency: "USD",
                intent: "capture",
                "enable-funding": "card",
                "disable-funding": "paylater,venmo"
              }}>
                {children}
              </PayPalScriptProvider>
            </PaymentProvider>
          </OrdersProvider>
        </DataProvider>
        
      </NotificationProvider>
    </ThemeProvider>
  );
}
