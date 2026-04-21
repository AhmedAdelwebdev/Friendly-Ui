'use client';

import Image from 'next/image';

export const LoadingOverlay = ({ message = 'Loading', type = 'default' }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-white backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      {/* Logo in center */}
      <div className="mb-8 flex items-center justify-center">
        <Image 
          src="/Friendly-Ui.png" 
          alt="Logo" 
          width={64} 
          height={64} 
          unoptimized
          className="size-28"
        />
      </div>

      {/* Loading Text with Animated Dots */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl font-heading text-primary flex items-center gap-1.5">
          <span className="tracking-tight">
            {message}
          </span>
          <span className="flex gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s]"></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s] [animation-delay:200ms]"></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s] [animation-delay:400ms]"></span>
          </span>
        </div>
        <p className="text-sm font-baloo text-gray-500 dark:text-gray-400 font-medium">
          {type === 'ocr' ? 'جاري تحليل الصورة بالذكاء الاصطناعي' : ''}
        </p>
      </div>
    </div>
  );
};
