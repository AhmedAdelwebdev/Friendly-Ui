'use client';

import Image from 'next/image';

export const LoadingOverlay = ({ message = 'Loading', type = 'default' }) => {
  return (
    <div className="fixed inset-0 z-[1000] bg-white backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      {/* Logo in center */}
      <div className="relative size-28 mb-8">
        <div className="absolute inset-0 m-auto size-28 bg-primary dark:bg-primary/50 blur-3xl rounded-full"></div>
        <div className="relative z-10 aspect-square rotate-2 hover:rotate-0 duration-500">
          <Image src="/Friendly-Ui.png" className="size-full" width={100} height={100} alt="" unoptimized/>
        </div>
      </div>

      {/* Loading Text with Animated Dots */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-2xl text-primary flex items-center gap-1.5">
          <span className={`tracking-tight ${/[\u0600-\u06FF]/.test(message) ? 'font-tajawal font-bold' : 'font-heading'}`}>
            {message}
          </span>
          <span className="flex gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s]"></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s] [animation-delay:200ms]"></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-duration:1s] [animation-delay:400ms]"></span>
          </span>
        </div>
        <p className="text-sm font-tajawal text-gray-500 dark:text-gray-400 font-medium" dir="rtl">
          {type === 'ocr' ? 'جاري تحليل الصورة ' : 
           type === 'upload' ? 'جاري تجهيز طلبك' : ''}
        </p>
      </div>
    </div>
  );
};
