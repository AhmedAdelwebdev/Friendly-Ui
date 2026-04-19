'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import { useOrders } from '@/lib/CartContext';
import { useTheme } from '@/lib/ThemeContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const { orders, setIsOrdersOpen } = useOrders();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-[100] bg-white backdrop-blur-2xl shadow shadow-black/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/Friendly-Ui.png" alt="Friendly UI Logo" width={45} height={45} unoptimized
            className="group-hover:scale-105 rounded-full transition-transform"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-lg text-primary">Friendly Ui</span>
            <span className="text-black/70 text-xs font-medium -mt-1">Ui/Ux Platform</span>
          </div>
        </Link>

        <div className='flex items-center gap-3'>
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/designs" className={`transition-colors ${isActive('/designs') ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}>Designs</Link>
            <Link href="/about" className={`transition-colors ${isActive('/about') ? 'text-primary' : 'text-gray-600 dark:text-gray-400 hover:text-primary'}`}>About</Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOrdersOpen(true)}
              className="relative p-2 hover:bg-primary/5 rounded-xl transition-colors group"
            >
              <ShoppingBag size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
              {orders.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] flex items-center justify-center rounded-full ">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-primary/5 rounded-xl transition-colors text-gray-600 dark:text-gray-400 hover:text-primary"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="md:hidden p-2 hover:bg-primary/20 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 py-3 px-4 flex flex-col gap-1">
          <Link href="/designs" onClick={() => setIsMenuOpen(false)} className="py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">Designs</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="py-2.5 px-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">About</Link>
        </div>
      )}
    </header>
  );
};
