'use client';

import {
  ShoppingCart, MessageCircle,
  Download, ShieldCheck,
  Check
} from 'lucide-react';
import Link from 'next/link';

const getDownloadLink = (link) => {
  if (!link) return '#';
  if (link.includes('drive.google.com')) {
    const match = link.match(/\/d\/(.*?)\//);
    const fileId = match?.[1];

    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
  return link;
};


export const ProductInfo = ({ item, isPurchased, onBuy }) => {
  const isProduct = item.type === 'Product';

  // Ensure features exist
  const features = item.features || [
    "Modern UI Design",
    "Fully Responsive Layout",
    "Optimized Performance",
    "Easy Customization",
  ];

  return (
    <div className="space-y-8 reveal animate-up lg:col-span-7">

      {/* Header */}
      <div className="reveal animate-up">
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm uppercase font-bold tracking-widest ring-1 ring-primary/20">
            {item.category}
          </span>
          <span className="text-gray-400 text-sm uppercase tracking-widest font-medium">
            {item.type}
          </span>
          {/* Price */}
          {isProduct && (
            <div className="flex items-baseline gap-3 ml-auto">
              <span className="text-4xl font-heading text-primary leading-none">
                ${Number(item.price)}
              </span>
              <span className="text-gray-400 line-through text-xl font-medium">
                ${item.price * 1.5}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-heading text-gray-900 mb-3 leading-[1.1]">
          {item.title}
        </h1>

        <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-xl">
          {item.description}
        </p>
      </div>


      {/* Features */}
      {features.length > 0 && (
        <div className="reveal animate-up space-y-4 delay-150">
          <h3 className="text-xl uppercase text-primary font-heading">
            Features
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((feature, index) => (
              <div key={index} className={`flex items-start gap-3 reveal animate-up delay-${(index + 1) * 100 > 700 ? 700 : (index + 1) * 100}`} >
                <span className="mt-2 size-2.5 rounded-full bg-primary shrink-0 shadow-[0_0_10px_rgba(117,73,251,0.4)]"></span>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Buttons */}
      <div className="flex flex-col md:flex-row gap-4 reveal animate-up delay-300">
        {isProduct ? (
          <>
            {isPurchased ? (
              <Link href={getDownloadLink(item.fileLink)} className="flex-1 bg-green-500 text-white min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 duration-200 active:scale-95" target="_blank" rel="noopener noreferrer">
                <Download size={24} strokeWidth={2.5} />
                Download Files
              </Link>
            ) : (
              <button onClick={() => onBuy(item)} className="flex-1 bg-primary text-white min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 duration-200 active:scale-95" >
                <ShoppingCart size={24} strokeWidth={2.5} />
                Buy Now
              </button>
            )}

            <Link href="https://t.me/Friendly_Ui" target="_blank" className="flex-1 text-gray-700 min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 bg-white hover:-translate-y-1 hover:bg-gray-200 duration-200 active:scale-95" >
              <MessageCircle size={24} />
              Custom Version
            </Link>
          </>
        ) : (
          <Link href="https://t.me/Friendly_Ui" target="_blank" className="flex-1 bg-primary text-white min-h-14 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:scale-95" >
            <MessageCircle size={24} />
            Order Custom Design
          </Link>
        )}
      </div>

    </div>
  );
};
