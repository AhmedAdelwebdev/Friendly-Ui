'use client';

import { useData } from '@/lib/DataContext';
import { DesignCard } from '@/components/designs/DesignCard';
import Link from 'next/link';
import { LoadingOverlay } from '../LoadingOverlay';

export const FeaturedDesigns = ({ type = 'Design', title = 'Featured Designs', limit = 8 }) => {
  const { items: allItems, loading } = useData();

  // Filter items based on type and slice for limit
  const items = allItems.filter(item => item.type == type).slice(0, limit);
  if (loading && allItems.length === 0) {
    return <LoadingOverlay message={`Loading ${type}s...`} />;
  }

  if (items.length === 0) return null;

  return items.length > 0 && (
    <section className={`py-12 md:py-16 ${type === 'Product' ? 'bg-gray-100/30' : ''}`}>
      <div className=" mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div className="flex-1 text-left">
            <h2 className="text-2xl md:text-3xl font-heading text-gray-900 mb-1">{title}</h2>
            <p className="text-gray-500 font-medium text-xs md:text-sm max-w-xl">
              {type === 'Design'
                ? 'A curated selection of my latest UI designs.'
                : 'Premium digital products available for purchase.'}
            </p>
          </div>
          <Link href={'/designs'} className="group flex items-center gap-1.5 text-primary  text-sm hover:gap-3 transition-all whitespace-nowrap">
            View All
          </Link>
        </div>

        <div className="grid grid-products gap-4">
          {items.map((item, index) => (
            <DesignCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
