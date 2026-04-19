'use client';

import {
  ShoppingCart, MessageCircle, Share2,
  Download, ShieldCheck
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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right duration-700">
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest ring-1 ring-primary/20">
            {item.category}
          </span>
          <span className="text-gray-400 text-xs uppercase tracking-widest font-medium">{item.type}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-heading text-gray-900 mb-3 leading-[1.1]">
          {item.title}
        </h1>

        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xl">
          {item.description}
        </p>
      </div>

      {isProduct && (
        <div className="flex items-end gap-4 p-6 bg-white rounded-xl">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-heading text-primary leading-none">${Number(item.price)}</span>
            <span className="text-gray-400 line-through text-lg font-medium">${(item.price * 1.5)}</span>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <div className="flex items-center gap-1 text-green-500 text-sm font-bold uppercase mb-1">
              <ShieldCheck size={16} /> Secure Deal
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {isProduct ? (
          <>
            {isPurchased ? (
              <Link href={getDownloadLink(item.fileLink)} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:scale-95">
                <Download size={24} strokeWidth={2.5} /> Download Files
              </Link>
            ) : (
              <button
                onClick={() => onBuy(item)}
                className="flex-1 bg-primary text-white min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:scale-95"
              >
                <ShoppingCart size={24} strokeWidth={2.5} /> Buy Now
              </button>
            )}
            <Link
              href="https://t.me/Friendly_Ui" target='_blank'
              className="flex-1 text-gray-700 min-h-16 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 bg-white hover:-translate-y-1 hover:bg-gray-200 transition-all active:scale-95"
            >
              <MessageCircle size={24} /> Custom Version
            </Link>
          </>
        ) : (
          <Link
            href="https://t.me/Friendly_Ui" target='_blank'
            className="flex-1 bg-primary text-white min-h-14 shadow-sm rounded-full text-base font-bold flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:scale-95"
          >
            <MessageCircle size={24} /> Order Custom Design
          </Link>
        )}
      </div>

    </div>
  );
};
