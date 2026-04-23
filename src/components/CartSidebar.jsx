'use client';

import { useState, useRef } from 'react';
import { useOrders } from '@/lib/CartContext';
import { useNotification } from '@/lib/NotificationContext';
import { X, ShoppingBag, Download, Clock, Trash2, RotateCcw, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_IMAGE } from '@/lib/data';


export const CartSidebar = () => {
  const { orders, isOrdersOpen, setIsOrdersOpen, removeOrder } = useOrders();

  return (
    <div 
      className={`fixed inset-0 z-[150] backdrop-blur-sm 
        transition-all duration-500 ease-out
        ${isOrdersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setIsOrdersOpen(false)} // إغلاق بالضغط على الخلفية
    >
      {/* Sidebar نفسه */}
      <div 
        className={`bg-white absolute right-0 top-0 h-full w-full max-w-sm shadow-2xl 
          transition-all duration-500 ease-out flex flex-col font-baloo
          ${isOrdersOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()} // منع إغلاق عند الضغط داخل الـ sidebar
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-sm font-heading text-gray-900 leading-none mb-1">My Library</h2>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Purchased Items</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrdersOpen(false)}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full transition-all hover:rotate-90 active:scale-90"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-20 px-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-primary">
                  <ShoppingBag size={48} strokeWidth={1.5} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-heading text-gray-900 mb-2">No items Found</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  Your purchased designs and products will appear in this library.
                </p>
              </div>
              <button
                onClick={() => setIsOrdersOpen(false)}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            orders.map((order, idx) => (
              <OrderItem
                order={order}
                onRemove={removeOrder}
                key={order.orderId || idx}
              />
            ))
          )}
        </div>

        {orders.length > 0 && (
          <div className="p-4 border-t border-border bg-gray-50 text-center">
            <p className="text-[10px] text-gray-400 font-medium">
              Need help with your orders?{' '}
              <Link href="https://t.me/Friendly_Ui" className="text-primary">
                Contact Telegram Support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};



const OrderItem = ({ order, onRemove }) => {
  const { showNotification } = useNotification();
  const [stage, setStage] = useState('idle'); // idle, confirm, undoing
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startDelete = () => {
    setStage('confirm');
    // Auto revert if not confirmed in 3 seconds
    setTimeout(() => {
      setStage(prev => prev === 'confirm' ? 'idle' : prev);
    }, 3000);
  };

  const confirmDelete = () => {
    setStage('undoing');
    setTimeLeft(5);

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = setTimeout(() => {
      onRemove(order.orderId || order.id);
      showNotification('Item removed from library | تم حذف المنتج من مكتبتك', 'success', 2000);
    }, 5000);
  };

  const undoDelete = () => {
    setStage('idle');
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
  };

  const getDownloadLink = (link) => {
    if (!link || typeof link !== 'string') return '#';
    if (link.includes('drive.google.com')) {
      const match = link.match(/\/d\/(.*?)\//);
      const fileId = match?.[1];

      if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }
    return link;
  };


  if (stage === 'undoing') {
    return (
      <div className="bg-red-400/20 p-4 rounded-2xl border border-red-400/70 flex items-center justify-between animate-in fade-in zoom-in duration-300">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 bg-white text-red-400  font-bold rounded-full flex items-center justify-center text-sm">
            {timeLeft}s
          </div>
          <div>
            <p className="text-sm text-red-600 font-bold">Removing Item...</p>
            <p className="text-[10px] text-red-400 font-medium uppercase tracking-wider">Tap undo to cancel</p>
          </div>
        </div>
        <button
          onClick={undoDelete}
          className="flex items-center gap-2 px-4 py-2 bg-body text-red-500 rounded-xl text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <RotateCcw size={14} /> Undo
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">

      {/* Header */}
      <div className="flex items-start gap-3">

        <div className="relative size-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
          <Image
            src={order.image || DEFAULT_IMAGE}
            className="size-full object-cover"
            alt="" unoptimized width={100} height={100}
            onError={(e) => { e.target.src = DEFAULT_IMAGE }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">

            <Link href={`/designs/${order.id}`} className="text-base font-semibold text-gray-900 truncate" >
              {order.title}
            </Link>

            <span className={`text-[10px] px-2 py-1 rounded-md ${order.status === 'completed'
              ? 'bg-green-600/10 text-green-600'
              : 'bg-yellow-600/10 text-yellow-600'
              }`}>
              {order.status === 'completed' ? 'Confirmed' : 'Pending'}
            </span>

          </div>

          {/* Meta */}
          <div className="flex items-center flex-wrap gap-2 mt-2 text-[11px] text-gray-500">

            {order.purchaseDate && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>
                  {new Date(order.purchaseDate).toLocaleString("en-US", {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            <button onClick={handleCopy} className="px-2.5 py-1 bg-gray-100 rounded-md text-gray-600 hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold" >
              {copied ? 'Copied!' : 'ID'}
            </button>

          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">

        {order.status === 'completed' ? (
          <Link
            href={getDownloadLink(order.fileLink) || '#'} target="_blank"
            className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          >
            <Download size={14} /> Download
          </Link>
        ) : (
          <div className="flex-1 bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <Clock size={14} /> Under Review
          </div>
        )}

        {stage === 'confirm' ? (
          <button
            onClick={confirmDelete}
            className="px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={startDelete}
            className="px-3 py-2.5 bg-gray-100 text-gray-400 rounded-xl hover:bg-red-50! hover:text-red-500! transition-all"
          >
            <X size={14} />
          </button>
        )}

      </div>
    </div>
  );

};
