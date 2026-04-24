'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export default function NotificationToast({ message, type = 'success', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null); // مرجع للمؤقت للتحكم به

  // دالة لبدء المؤقت
  const startTimer = () => {
    if (duration === 'stop') return;
    
    timerRef.current = setTimeout(() => {
      handleClose();
    }, duration);
  };

  // دالة لإيقاف المؤقت
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    setIsVisible(true);
    startTimer();

    return () => clearTimer();
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[300] w-full max-w-lg sm:max-w-3xl px-8 transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
        onMouseEnter={clearTimer} onMouseLeave={startTimer} 
    >
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-lg
        ${type === 'success' 
          ? 'bg-green-600/40 border-green-600/30 text-green-600' 
          : 'bg-red-600/40 border-red-600/30 text-red-600'
        }`}>
        
        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white`}>
          {type === 'success' ? (
            <CheckCircle size={24} className="animate-in zoom-in duration-500" />
          ) : (
            <AlertCircle size={24} className="animate-in zoom-in duration-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {message.includes('|') ? (
            <div className="flex flex-col">
              <p className="text-sm text-gray-900 font-semibold leading-tight">
                {message.split('|')[0].trim()}
              </p>
              <p className="text-[12px] text-gray-800 font-medium leading-tight mt-0.5">
                {message.split('|')[1].trim()}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-900 font-semibold leading-tight">{message}</p>
          )}
        </div>

        <button 
          className="flex-shrink-0 p-2 -mr-1 bg-red-500/20 rounded-xl transition-colors bg-white"
          onClick={handleClose}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}