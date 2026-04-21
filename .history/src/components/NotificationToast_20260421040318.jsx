'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export default function NotificationToast({ message, type = 'success', onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fade-in fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] w-full max-w-sm px-4">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border transition-all duration-300
        ${type === 'success' 
          ? 'bg-white border-green-600/15 text-green-600' 
          : 'bg-white border-red-600/15 text-red-600'
        }`}>
        
        <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          ${type === 'success' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
          {type === 'success' ? (
            <CheckCircle size={22} />
          ) : (
            <AlertCircle size={22} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium leading-tight">{message}</p>
        </div>

        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1.5 -mr-1 text-gray-400 hover:text-gray-600 hover:bg-primary/20 rounded-full transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}