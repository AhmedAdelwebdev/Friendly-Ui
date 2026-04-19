'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { OrdersProvider } from "@/lib/CartContext";
import { PaymentProvider } from "@/lib/PaymentContext";
import { DataProvider } from "@/lib/DataContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import Script from 'next/script';

const PAYPAL_CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID).trim();

if (!PAYPAL_CLIENT_ID) {
  throw new Error("PayPal Client ID is missing");
}

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <DataProvider>
        <OrdersProvider>
          <PaymentProvider>
            <PayPalScriptProvider options={{ 
              "client-id": PAYPAL_CLIENT_ID,
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
    </ThemeProvider>
  );
}
