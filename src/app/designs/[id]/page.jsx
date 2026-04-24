'use client';

import { useParams, useRouter } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { usePayment } from '@/lib/PaymentContext';
import { useOrders } from '@/lib/CartContext';
import { ProductGallery } from '@/components/designs/ProductGallery';
import { ProductInfo } from '@/components/designs/ProductInfo';
import { RelatedSection } from '@/components/designs/RelatedSection';
import { MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useNotification } from '@/lib/NotificationContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const payment = usePayment();
  const { openPayment } = payment || { openPayment: () => {} };
  const { orders } = useOrders();
  const { items, loading } = useData();

  const item = useMemo(() => {
    return items.find((d) => String(d.id) === String(id));
  }, [items, id]);

  const isPurchased = useMemo(() => {
    return orders.some(o => o.productId === item?.id && o.status === 'completed');
  }, [orders, item]);

  const relatedItems = useMemo(() => {
    if (!item || !items.length) return [];
    let filtered = items.filter((d) => d.id !== item.id && d.category === item.category);
    if (filtered.length < 3) {
      const extra = items.filter((d) => d.id !== item.id && d.category !== item.category);
      filtered = [...filtered, ...extra.slice(0, 3 - filtered.length)];
    }
    return filtered.slice(0, 3);
  }, [item, items]);

  const { showNotification } = useNotification();

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({ title: item.title, url: window.location.href });
        } catch (err) { }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard | تم نسخ الرابط إلى الحافظة', 'success');
      }
    }
  };

  if (!item) {
    if (!item || (loading && items.length === 0)) {
      return <LoadingOverlay />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center flex-col text-center p-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-black/20 mb-6">
          <MessageCircle size={48} />
        </div>
        <h2 className="text-3xl font-heading text-gray-900 mb-4">Design Not Found</h2>
        <button onClick={() => router.back()} className="text-primary font-bold hover:underline">Return to Gallery</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <ProductGallery images={item.images} title={item.title} category={item.category} />
          <ProductInfo
            item={item}
            isPurchased={isPurchased}
            onBuy={openPayment}
            onShare={handleShare}
          />
        </div>
      </div>

      {(relatedItems.length > 1) && <RelatedSection relatedItems={relatedItems} className="reveal animate-up" />}
    </div>
  );
}
