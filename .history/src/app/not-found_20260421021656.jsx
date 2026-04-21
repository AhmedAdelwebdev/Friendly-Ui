import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {/* Icon/Art */}
      <div className="relative mb-8">
        <div className="text-[8rem] font-heading text-primary/70 select-none leading-none animate- duration-[2000ms]">404</div>
      </div>

      {/* Content */}
      <h1 className="text-2xl font-heading text-gray-400 mb-4">
        Oops! Page Lost in Space
      </h1>
      <p className="text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>

      {/* Action */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
      >
        <Home size={18} />
        Go Back Home
      </Link>
    </div>
  );
}
