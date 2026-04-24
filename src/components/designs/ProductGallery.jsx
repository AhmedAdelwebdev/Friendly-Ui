'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DEFAULT_IMAGE } from '@/lib/data';

export const ProductGallery = ({ images = [], title }) => {
  const imgs = images.length ? images : [DEFAULT_IMAGE];

  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);

  const startX = useRef(0);
  const isDragging = useRef(false);

  const next = () => setIndex((prev) => (prev + 1) % imgs.length);
  const prev = () => setIndex((prev) => (prev - 1 + imgs.length) % imgs.length);

  // Start
  const handleStart = (clientX) => {
    isDragging.current = true;
    startX.current = clientX;
  };

  // Move (real drag 👈)
  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    setDragX(clientX - startX.current);
  };

  // End
  const handleEnd = () => {
    if (!isDragging.current) return;

    if (dragX < -80) next();
    else if (dragX > 80) prev();

    setDragX(0);
    isDragging.current = false;
  };

  return (
    <div className="space-y-4 lg:col-span-5 revealanimate-up">

      {/* Slider */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl group select-none"
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Track */}
        <div 
          style={{
            display: 'flex',
            transform: `translateX(calc(-${index * 100}% + ${dragX}px))`,
            transition: isDragging.current ? 'none' : 'transform 0.4s ease',
          }}
        >
          {imgs.map((img, i) => (
            <div key={i} className="min-w-full aspect-square relative bg-gray-100">
              <Image
                src={img}
                alt={`${title}-${i}`}
                priority width={300} height={300}
                className="object-cover pointer-events-none size-full"
                draggable={false} unoptimized
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hidden sm:block">
          <ChevronLeft size={20} />
        </button>

        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition hidden sm:block">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2">
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-primary' : 'w-2 bg-primary/30'
              }`}
          />
        ))}
      </div>
    </div>
  );
};
