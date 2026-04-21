'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Lock,
  Loader2,
  LogOut,
} from 'lucide-react';
import Image from 'next/image';
import { DEFAULT_IMAGE } from '@/lib/data';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function OrdersDashboard() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  const [countdowns, setCountdowns] = useState({});
  const timersRef = useRef({});

  const authenticateGoogle = () => {
    if (!CLIENT_ID) {
      setError("Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env.local");
      return;
    }
    const scope = 'https://www.googleapis.com/auth/userinfo.email';
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/orders` : '';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=select_account`;
    window.location.href = authUrl;
  };

  const verifyAccessToken = async (token) => {
    setLoading(true);
    setCheckingAuth(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setAuthenticated(true);
      } else {
        const errorData = await res.json();
        console.error("Auth Failure Full response:", errorData);

        // If the email is not authorized, redirect to home
        if (res.status === 401 && errorData.error === 'Unauthorized email') {
          router.push('/');
          return;
        }

        setError(errorData.error + (errorData.details ? `: ${JSON.stringify(errorData.details)}` : ' (Email mismatch?)'));
      }
    } catch (err) {
      setError('Connection Error: ' + err.message);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setAuthenticated(false);
    setOrders([]);
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      if (res.ok) {
        setAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashToken = hashParams.get('access_token');
      const hashError = hashParams.get('error');

      if (hashToken) {
        window.history.replaceState({}, document.title, window.location.pathname);
        await verifyAccessToken(hashToken);
      } else if (hashError) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setError('Google Login failed or was cancelled.');
        setCheckingAuth(false);
      } else {
        checkAuth();
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    let interval;
    if (authenticated) {
      fetchData();

      // Smart Polling: Every 120 seconds, only if tab is focused
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchData();
        }
      }, 120000);
    }
    return () => clearInterval(interval);
  }, [authenticated]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timersRef.current) {
        Object.values(timersRef.current).forEach(clearInterval);
      }
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const sorted = ordersData.sort((a, b) => {
          const dateA = new Date(a.orderDate || 0);
          const dateB = new Date(b.orderDate || 0);
          return dateB - dateA;
        });

        // Smart Update: Don't let polling overwrite items we JUST confirmed
        setOrders(prev => {
          if (!prev || prev.length === 0) return sorted;

          return sorted.map(newOrder => {
            const existing = prev.find(o => o._recordId === newOrder._recordId);
            // If we just marked it as Completed locally and server still says Pending
            if (existing && existing.status === 'Completed' && newOrder.status !== 'Completed') {
              // Keep local status if updated within the last 30s
              if (existing.lastLocalUpdate && (Date.now() - existing.lastLocalUpdate < 30000)) {
                return { ...newOrder, status: 'Completed', lastLocalUpdate: existing.lastLocalUpdate };
              }
            }
            return newOrder;
          });
        });
      }

      if (productsRes.ok) {
        setProducts(await productsRes.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startConfirmation = (order) => {
    const recordId = order._recordId;
    if (timersRef.current[recordId]) return;

    let timeLeft = 5;
    setCountdowns(prev => ({ ...prev, [recordId]: timeLeft }));

    timersRef.current[recordId] = setInterval(() => {
      timeLeft -= 1;

      if (timeLeft <= 0) {
        clearInterval(timersRef.current[recordId]);
        delete timersRef.current[recordId];
        setCountdowns(prev => {
          const next = { ...prev };
          delete next[recordId];
          return next;
        });
        confirmOrder(order);
      } else {
        setCountdowns(prev => ({ ...prev, [recordId]: timeLeft }));
      }
    }, 1000);
  };

  const cancelConfirmation = (recordId) => {
    if (timersRef.current[recordId]) {
      clearInterval(timersRef.current[recordId]);
      delete timersRef.current[recordId];
    }
    setCountdowns(prev => {
      const next = { ...prev };
      delete next[recordId];
      return next;
    });
  };

  const confirmOrder = async (order) => {
    const confirmationTimestamp = new Date().toISOString();

    // Optimistic Update: Change status immediately in UI
    setOrders(prev => prev.map(o =>
      o._recordId === order._recordId ? { ...o, status: 'Completed', confirmedDate: confirmationTimestamp, lastLocalUpdate: Date.now() } : o
    ));

    try {
      const updateRes = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: order._recordId,
          status: 'Completed',
          confirmedDate: confirmationTimestamp
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || updateData.details || 'Update failed on server.');

      // Background Delivery
      const product = products.find(p => {
        const pTitle = (p.title || '').trim().toLowerCase();
        const oProd = (order.product || '').trim().toLowerCase();
        return pTitle === oProd || p.id === order.productId || p._recordId === order.productId;
      });

      const fileLink = product?.fileLink || '#';

      fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: order.userEmail,
          order: { name: order.userName, productName: order.product || 'Your Product' },
          fileLink
        }),
      }).catch(e => console.error('Delivery failed in background:', e));

      // Final Sync: Ensure local state matches server exactly
      const updatedRecord = updateData.record || updateData;
      const actualStatus = updatedRecord.fields?.status || updatedRecord.fields?.Status || 'Completed';
      setOrders(prev => prev.map(o =>
        o._recordId === order._recordId ? { ...o, status: actualStatus } : o
      ));

    } catch (err) {
      alert('حدث خطأ أثناء التأكيد: ' + err.message);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        (order._recordId?.includes(searchTerm)) ||
        (order.product?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userName?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);


  if (!authenticated) {
    return (
      <div className="min-w-full min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full bg-white rounded-2xl p-6 md:p-8 shadow-sm shadow-black/10">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Lock className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-xl text-center mb-2 text-primary">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 text-center mb-8">Choose your login method to continue</p>

          <div className="flex flex-col gap-4">
            {!CLIENT_ID ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex flex-col items-center text-center gap-2">
                <Info className="w-6 h-6" />
                <p className="font-bold">Google Client ID is missing!</p>
                <p>Please add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your <code>.env.local</code> file and restart the server.</p>
              </div>
            ) : (
              <button
                onClick={authenticateGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              >
                {loading && !checkingAuth ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            )}
          </div>

          {error && <p className="text-red-500 text-sm mt-4 text-center bg-red-50 p-2 rounded-lg">{error}</p>}
        </div>
      </div>
    );
  }

  // Row Renderer for Desktop and Mobile
  const renderActions = (order, isCompleted, isCountdown) => {
    if (isCompleted) {
      return (
        <div className="flex flex-col items-center gap-1 grow md:grow-0 justify-center p-3 bg-green-500/20 text-green-500 rounded-lg cursor-default">
          {order.confirmedDate && (
            <span className="text-sm font-medium">
              {new Date(order.confirmedDate).toLocaleString("en-US", {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      );
    }

    if (isCountdown) {
      return (
        <button
          onClick={() => cancelConfirmation(order._recordId)}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 w-full md:w-auto"
        >
          <XCircle className="w-4 h-4" />
          Cancel ({countdowns[order._recordId]}s)
        </button>
      );
    }

    return (
      <button
        onClick={() => startConfirmation(order)}
        className="px-5 py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-1.5 w-full md:w-auto"
      >
        <CheckCircle className="w-4 h-4" />
        Confirm
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-20 w-screen relative left-1/2 -translate-x-1/2 bg-gray-50/30">
      {loading && <LoadingOverlay />}
      {checkingAuth && <LoadingOverlay message="Securing session" />}

      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto w-full px-4 h-16 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="p-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="size-4" />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-all ${showSearch ? 'text-primary bg-primary/10' : 'text-gray-500 hover:text-primary! hover:bg-primary/20'}`}
              title="Toggle Search Bar"
            >
              <Search className="size-4" />
            </button>
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-primary! hover:bg-primary/20 rounded-lg transition-colors"
              title="Refresh"
            >
              <Clock className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {['All', 'Pending'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1 text-sm rounded-lg transition-all ${statusFilter === status
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-text! hover:bg-primary/20'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="w-full max-w-6xl px-4 py-6 mx-auto">
        {showSearch && (
          <div className="flex flex-col md:flex-row gap-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customers or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary! transition-all text-sm"
              />
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">No orders found.</p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-primary/80 *:p-4 *:text-xs *:text-text *:uppercase *:tracking-wider *:font-medium">
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/30">
                  {filteredOrders.map((order) => {
                    const isCountdown = countdowns[order._recordId] !== undefined;
                    const isManual = order.paymentMethod === 'Vodafone Cash';
                    const displayMethod = order.paymentMethod === 'Vodafone Cash' ? 'Vodafone' : order.paymentMethod;
                    const isCompleted = (order.status || '').toLowerCase() === 'completed';

                    return (
                      <tr key={order._recordId} className={`hover:bg-gray-primary/20! transition-colors`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base relative ${isCompleted ? 'bg-green-500/20 text-green-600' : 'bg-primary/10 text-primary'
                              }`}>
                              {order.userName?.charAt(0) || 'U'}
                              {/* Pulse for very recent orders */}
                              {!isCompleted && (new Date() - new Date(order.orderDate)) < (10 * 60000) && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white animate-pulse" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-gray-800 text-sm font-medium">{order.userName}</p>
                                {!isCompleted && (new Date() - new Date(order.orderDate)) < (10 * 60000) && (
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded uppercase tracking-tighter animate-bounce">New</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-400">{order.userEmail}</p>
                                {order.orderId && (
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                    {order.orderId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                              <Image
                                src={products.find(p => p.title === order.product || p.id === order.productId)?.image || order.image || DEFAULT_IMAGE}
                                alt=""
                                width={50} height={50}
                                className="size-full object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="text-gray-700 text-sm font-medium">{order.product}</p>
                              <p className="text-xs text-gray-400 mt-0.5">${order.price}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600 text-sm font-medium">
                            {order.orderDate ? new Date(order.orderDate).toLocaleString("en-US", {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '---'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] ${isManual
                            ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                            {displayMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {renderActions(order, isCompleted, isCountdown)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className="md:hidden flex flex-col gap-4">
              {filteredOrders.map((order) => {
                const isCountdown = countdowns[order._recordId] !== undefined;
                const isManual = order.paymentMethod === 'Vodafone Cash';
                const displayMethod = isManual ? 'Vodafone' : order.paymentMethod;
                const isCompleted = (order.status || '').toLowerCase() === 'completed';

                return (
                  <div key={order._recordId} className={`bg-white border border-border rounded-xl overflow-hidden flex flex-col`}>
                    {/* Header */}
                    <div className={`px-4 py-3 border-b border-border flex justify-between items-center`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm relative bg-primary/10 text-primary`}>
                          {order.userName?.charAt(0) || 'U'}
                          {!isCompleted && (new Date() - new Date(order.orderDate)) < 120000 && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-gray-800 font-medium truncate">{order.userName}</p>
                            {!isCompleted && (new Date() - new Date(order.orderDate)) < 120000 && (
                              <span className="px-1 py-0.5 bg-red-100 text-primary text-[6px] font-bold rounded uppercase animate-bounce">New</span>
                            )}
                          </div>
                          <p className="text-sm text-text/70 truncate">
                            {order.orderDate ? new Date(order.orderDate).toLocaleString("en-US", {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : order.userEmail}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${isManual
                        ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        }`}>
                        {displayMethod}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-50 border border-border overflow-hidden shrink-0">
                          <Image
                            src={products.find(p => p.title === order.product || p.id === order.productId)?.image || order.image || DEFAULT_IMAGE}
                            alt=""
                            width={60} height={60}
                            className="size-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Product</p>
                          <p className="text-sm text-gray-800 font-medium">{order.product}</p>
                          <p className="text-sm font-medium text-primary mt-1">${order.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className={`px-4 py-3 flex justify-end items-center border-t border-border`}>
                      <div className="w-full flex justify-end gap-2">
                        {renderActions(order, isCompleted, isCountdown)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
