'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useOrders } from '@/lib/CartContext';
import { useTheme } from '@/lib/ThemeContext';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Sun, Moon, Palette, Info } from 'lucide-react';

export const Header = () => {
  const { orders, setIsOrdersOpen } = useOrders();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 reveal animate-down delay-300 z-[100] bg-white backdrop-blur-2xl shadow shadow-black/5 duration-300 rounded-b-2xl">
      <div className="maxWidth mx-auto px-4 sm:px-10 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/Friendly-Ui.png" loading="eager" alt="" width={45} height={45} unoptimized
            className="size-12 sm:size-14 group-hover:scale-105 duration-300!"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg sm:text-xl text-primary not-italic">Friendly Ui</span>
            <span className="text-black/70 text-xs sm:text-sm font-medium -mt-1">Ui/Ux Platform</span>
          </div>
        </Link>

        <div className='flex items-center gap-3'>
          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm sm:text-lg font-semibold">
            <Link href="/designs" className={`transition-colors ${isActive('/designs') ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}>Designs</Link>
            <Link href="/about" className={`transition-colors ${isActive('/about') ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}>About</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="sm:hidden p-2 hover:bg-primary/20 rounded-xl">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <button onClick={toggleTheme} className="p-2 hover:bg-primary/5 rounded-xl transition-colors text-gray-600 dark:text-gray-400 hover:text-primary" aria-label="Toggle Theme" >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button onClick={() => setIsOrdersOpen(true)} className="relative p-2 hover:bg-primary/5 rounded-xl transition-colors group" >
              <ShoppingBag size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
              {orders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full ">
                  {orders.length}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu */}
      <div className={`absolute top-16 left-0 right-0 md:hidden border-t border-gray-100 overflow-hidden py-3 px-4 flex flex-col gap-1 transition-all duration-300 ease-out *:hover:bg-primary/20 bg-white backdrop-blur-2xl shadow shadow-black/5
        ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>

        <Link href="/designs" onClick={() => setIsMenuOpen(false)} className="py-2.5 px-3 text-base text-gray-700 dark:text-gray-300 rounded-xl transition-all flex items-center gap-3">
          <Palette size={20} /> Designs
        </Link>

        <Link href="/about" onClick={() => setIsMenuOpen(false)} className="py-2.5 px-3 text-base text-gray-700 dark:text-gray-300 rounded-xl transition-all flex items-center gap-3">
          <Info size={20} /> About
        </Link>

      </div>
    </header>
  );
};
