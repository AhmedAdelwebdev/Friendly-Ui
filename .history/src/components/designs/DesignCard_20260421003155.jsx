'use client';

// import { usePayment } from '@/lib/PaymentContext';
import { useOrders } from '@/lib/CartContext';
import { DEFAULT_IMAGE } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Download } from 'lucide-react';

export const DesignCard = ({ item, index, related }) => {
  // const { openPayment } = usePayment();
  const { orders } = useOrders();
  const isProduct = item.type === 'Product';
  // const isPurchased = orders.some(o => o.productId === item.id && o.status === 'completed');

  return (
    <div 
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md flex flex-col h-full border border-gray-100 ${related ? '' : ''}`}>
      <Link href={`/designs/${item.id}`} className="aspect-square relative bg-white overflow-hidden block">

        <Image
          src={item.image || DEFAULT_IMAGE} alt={item.title} width={100} height={100} unoptimized
          className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/10 to-transparent group-hover:opacity-0 duration-300" />

        {/* Top Row */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-sm font-medium text-primary">

          {/* Category */}
          <span className="bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-lg">
            {item.category}
          </span>

          {/* Price */}
          {isProduct && (
            <span className="bg-primary/10 backdrop-blur-sm px-3 py-1 rounded-lg">
              ${Number(item.price)}
            </span>
          )}

        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2 group-hover:opacity-0 group-hover:translate-y-2 group-hover:invisible duration-300">

          {/* Title */}
          <span className="text-lg tracking-wide text-white group-hover:text-black line-clamp-1 capitalize drop-shadow-md duration-300">
            {item.title}
          </span>

          {/* Button */}
          {/* {isProduct && (
            <div className="sm:scale-90 hover:scale-105 flex items-center gap-2 bg-primary text-white rounded-xl text-xs hover:bg-primary-dark transition-all shadow-lg">
              {isPurchased ? (
                  <Link href={item.fileLink} target="_blank" rel="noopener noreferrer" className="px-3.5 py-2"                >
                    <Download size={18} />
                  </Link>
                ) : (
                  <button onClick={(e) => { e.preventDefault(); openPayment(item); }}  className="px-3.5 py-2">
                    <ShoppingCart size={18} />
                  </button>
                )
              }
            </div>
          )} */}

        </div>

      </Link>
    </div>
  );
};
