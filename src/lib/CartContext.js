'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import NotificationToast from '@/components/NotificationToast';

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem('friendly_orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
        
        // Background refresh: update images and file links from Airtable to prevent URL expiration
        (async () => {
          try {
            const res = await fetch('/api/database/products');
            if (res.ok) {
              const products = await res.json();
              setOrders(prev => prev.map(order => {
                const product = products.find(p => p._recordId === order._recordId || p.id === order.productId);
                if (product) {
                  return { 
                    ...order, 
                    image: product.image || order.image,
                    // If verified, ensure fileLink is also fresh
                    fileLink: order.status === 'completed' ? (product.fileLink || order.fileLink) : order.fileLink
                  };
                }
                return order;
              }));
            }
          } catch (e) {
            console.error("Failed to refresh orders in background", e);
          }
        })();
      } catch (e) {
        console.error("Failed to parse orders", e);
      }
    }
  }, []);

  // Save orders to localStorage when they change
  useEffect(() => {
    localStorage.setItem('friendly_orders', JSON.stringify(orders));
  }, [orders]);

  const syncPendingOrders = async () => {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length === 0) return;

    try {
      const updatedOrders = [...orders];
      let hasChanges = false;

      await Promise.all(pendingOrders.map(async (order) => {
        try {
          const res = await fetch(`/api/database/orders?id=${order.orderId}`, { cache: 'no-store' });
          if (!res.ok) return;
          
          const orderData = await res.json();
          const st = (orderData.status || '').toLowerCase();
          if (orderData && (st === 'confirmed' || st === 'completed')) {
            const idx = updatedOrders.findIndex(o => o.orderId === order.orderId);
            if (idx !== -1) {
              updatedOrders[idx] = { 
                ...updatedOrders[idx], 
                status: 'completed',
                fileLink: orderData.fileLink || orderData.filelink || updatedOrders[idx].fileLink
              };
              hasChanges = true;
            }
          }
        } catch (e) {
          console.error(`Failed to sync order ${order.orderId}`, e);
        }
      }));

      if (hasChanges) {
        setOrders(updatedOrders);
        setNotification({
          message: "Order Approved! | تم الموافقة على طلبك بنجاح!",
          type: 'success'
        });
      }
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  // Poll for updates every 30 seconds if there are pending orders
  useEffect(() => {
    const interval = setInterval(() => {
      syncPendingOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [orders]);

  const addOrder = async (item, details = {}) => {
    const newOrder = {
      ...item,
      productId: item.id, // Save reference
      orderId: details.id || Date.now(),
      purchaseDate: new Date().toISOString(),
      status: details.status || 'completed'
    };

    // Backend POST is handled by PaymentModal before adding locally
    setOrders(prev => [newOrder, ...prev]);
    setIsOrdersOpen(true);
  };

  const removeOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.orderId !== orderId));
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        isOrdersOpen,
        setIsOrdersOpen,
        addOrder,
        removeOrder,
      }}
    >
      {children}
      {notification && (
        <NotificationToast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
