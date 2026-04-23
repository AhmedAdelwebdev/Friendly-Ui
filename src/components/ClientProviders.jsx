'use client';

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { OrdersProvider } from "@/lib/CartContext";
import { PaymentProvider } from "@/lib/PaymentContext";
import { DataProvider } from "@/lib/DataContext";
import { NotificationProvider, useNotification } from "@/lib/NotificationContext";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import { LoadingOverlay } from "./LoadingOverlay";
import { usePathname } from "next/navigation";

const PAYPAL_CLIENT_ID = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '').trim();

if (!PAYPAL_CLIENT_ID) {
  console.warn("PayPal Client ID is missing. PayPal functionality will be disabled.");
}

function ScrollReveal() {
  useEffect(() => {
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Once it's revealed, we can stop observing it
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      threshold: 0.1, // More lenient threshold
      rootMargin: '0px' // Remove negative margin to trigger as soon as it enters
    };

    const observer = new IntersectionObserver(revealCallback, observerOptions);

    const observeElements = () => {
      const elements = document.querySelectorAll('.reveal:not(.in-view)');
      elements.forEach(el => {
        observer.observe(el);
      });
    };

    // Initial run - wrap in requestAnimationFrame to ensure DOM is fully painted
    requestAnimationFrame(() => {
      observeElements();
    });

    // Use MutationObserver to detect new elements
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
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
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Start loading on route change
    setLoading(true);
    setIsAppReady(false);

    // Use a small delay to ensure React has started rendering the new page
    const timer = setTimeout(() => {
      setLoading(false);
      // Brief delay after hiding loader before starting animations for better UX
      setTimeout(() => setIsAppReady(true), 100);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <ThemeProvider>
      {loading && <LoadingOverlay message="Friendly UI" />}
      {isAppReady && <ScrollReveal />}
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
        </GlobalErrorHandler>
      </NotificationProvider>
    </ThemeProvider>
  );
}
