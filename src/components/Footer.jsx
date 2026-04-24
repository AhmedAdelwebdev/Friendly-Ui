'use client';

import Image from 'next/image';
import Link from 'next/link';

export const Footer = () => {
  const currentYear =
    typeof window !== 'undefined' ? new Date().getFullYear() : '2026';

  return (
    <footer className="border-t border-gray-100 bg-white shadow-sm shadow-black/20">
      <div className="maxWidth mx-auto px-4 py-5">

        {/* Top */}
        <div className="flex items-center justify-between gap-4">

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

          {/* Links */}
          <div className="hidden sm:flex items-center gap-6 text-sm sm:text-xl text-gray-500">
            <Link href="/designs" className="hover:text-primary transition">
              Designs
            </Link>
            <Link href="/about" className="hover:text-primary transition">
              About
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="https://t.me/Friendly_Ui" target="_blank"
            className="text-base sm:text-lg bg-primary text-white px-4 sm:px-8 py-2 rounded-full hover:opacity-90 transition"
          >
            Contact Me
          </Link>
        </div>

        {/* Bottom */}
        <div className="mt-8 text-center text-xs text-gray-400">
          © {currentYear} Friendly UI — Built by Ahmed Adel
        </div>
      </div>
    </footer>
  );
};
