'use client';

import Link from 'next/link';
import Image from 'next/image';

export const HeroSection = () => {
  return (
    <section className="relative py-12">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className=" mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
          {/* Content */}
          <div className="flex-1 text-center sm:text-left space-y-4">
            <div className="text-2xl md:text-3xl font-heading text-gray-900 leading-tight" data-aos="fade-right" suppressHydrationWarning>
              <h2 className="text-primary text-5xl">Friendly Ui</h2>
              <h2 className="mt-3">Where Ideas Meet Design</h2>
            </div>
            <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0" data-aos="fade-right" data-aos-delay="100" suppressHydrationWarning>
              Designing clean interfaces and building smart solutions. Explore my latest work, premium products, and creative experiments.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 pt-4" data-aos="fade-up" data-aos-delay="200" suppressHydrationWarning>
              <Link
                href="/designs?type=product"
                className="bg-primary text-white px-16 py-2.5 rounded-full text-lg shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all duration-300"
              >
                Visit Store
              </Link>
            </div>
          </div>

          {/* Banner Image */}
          <div className='flex-1' data-aos="fade-left" data-aos-delay="300" suppressHydrationWarning>
            <div className="relative h-76 rounded-4xl overflow-hidden shadow-full border-4 border-white">
              <Image src="/Bannar.png" loading="eager" alt="Friendly UI Banner" width={100} height={100} unoptimized
                className="size-full object-cover"
              />
              <div className="size-full absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
