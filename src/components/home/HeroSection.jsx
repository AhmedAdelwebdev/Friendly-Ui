'use client';

import Link from 'next/link';
import Image from 'next/image';

export const HeroSection = () => {
  return (
    <section className="relative py-12 min-h-lg">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full maxWidth h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="mx-auto px-4">
        <div className="flex flex-wrap flex-col lg:flex-row items-center justify-between gap-10">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left space-y-4 lg:space-y-6">
            <div className="text-2xl lg:text-3xl font-heading text-gray-900 leading-tight reveal animate-up" suppressHydrationWarning>
              <h2 className="text-primary text-5xl">Friendly Ui</h2>
              <h2 className="mt-3 lg:mt-6">Where Ideas Meet Design</h2>
            </div>
            <p className="text-base lg:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 reveal animate-up delay-100" suppressHydrationWarning>
              Designing clean interfaces and building smart solutions. Explore my latest work, premium products, and creative experiments.
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-3 pt-4 reveal animate-up delay-200" suppressHydrationWarning>
              <Link href="/designs" className="bg-primary text-white px-16 py-2.5 rounded-full text-lg shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all duration-300">
                Explore Designs
              </Link>
            </div>
          </div>

          {/* Banner Image */}
          <div className='flex-1 reveal animate-up delay-300' suppressHydrationWarning>
            <div className="relative h-64 sm:h-full max-w-xl rounded-4xl overflow-hidden shadow-full border-4 border-white">
              <Image src="/Bannar.png" alt="Friendly UI Banner" width={100} height={100} unoptimized
                className="size-full object-cover" priority
              />
              <div className="size-full absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
