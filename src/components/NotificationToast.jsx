'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function NotificationToast({ message, type = 'success', onClose, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-5 duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
        type === 'success' ? 'bg-white border-green-100' : 'bg-white border-red-100'
      }`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
        }`}>
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="font-heading text-gray-900 text-sm">{message}</p>
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Order Approved!</p>
        </div>
        <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="ml-4 p-1 hover:bg-gray-100 rounded-full text-gray-400">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
