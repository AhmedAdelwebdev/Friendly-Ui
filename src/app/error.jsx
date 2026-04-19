'use client';

import { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} />
      </div>
      
      <h1 className="text-3xl font-heading text-gray-900 mb-4">Something went wrong!</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
        We apologize for the inconvenience. An unexpected error occurred. Please try refreshing the page.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <RefreshCw size={18} />
        Try Again
      </button>
    </div>
  );
}
