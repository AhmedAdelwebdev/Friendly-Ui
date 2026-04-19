'use client';

import Link from 'next/link';

export const Footer = () => {
  const currentYear =
    typeof window !== 'undefined' ? new Date().getFullYear() : '2026';

  return (
    <footer className="border-t border-gray-100 bg-white shadow-sm shadow-black/20">
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Top */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <Link href="/" className="text-lg font-heading text-primary">
            Friendly UI
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/designs" className="hover:text-primary transition">
              Designs
            </Link>
            <Link href="/about" className="hover:text-primary transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary transition">
              Contact
            </Link>
          </div>

          {/* CTA */}
          <Link
            href="https://t.me/Friendly_Ui" target="_blank"
            className="text-sm bg-primary text-white px-10 sm:px-4 py-2 rounded-full hover:opacity-90 transition"
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
