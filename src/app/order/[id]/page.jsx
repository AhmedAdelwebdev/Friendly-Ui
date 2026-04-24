'use client';

import { useEffect, useState, use } from 'react';
import { getLanguage, setLanguage } from '@/utils/storage';
import { translations, getTranslation } from '@/lang/translations';
import { getDownloadLink, formatDate } from '@/utils/formatters';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const savedLang = getLanguage();
    setLangState(savedLang);
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/database/orders?id=${id}`);
      if (!res.ok) throw new Error('Order not found');
      const foundOrder = await res.json();
      
      let fileUrl = null;
      if (foundOrder.status === 'Completed' || foundOrder.Status === 'Completed') {
        const prodRes = await fetch('/api/database/products');
        if (prodRes.ok) {
           const prods = await prodRes.json();
           const match = prods.find(p => p.title === foundOrder.product || p.title === foundOrder.productName || p.id === foundOrder.productId);
           if (match) fileUrl = match.fileLink || match.link || '#';
        }
      }
      
      setOrder({ ...foundOrder, fileLink: fileUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLangState(newLang);
    setLanguage(newLang);
  };

  const t = (key, params) => getTranslation(lang, key, params);

  if (loading) return <LoadingOverlay />;
  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
        <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl mb-2">Order Not Found</h2>
        <p>The order ID you provided is invalid or the order has been removed.</p>
      </div>
    </div>
  );

  const isCompleted = (order.status || '').toLowerCase() === 'completed';

  return (
  <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen bg-gray-50 ${lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
    {/* Container */}
    <div className="max-w-xl lg:max-w-2xl mx-auto px-4 lg:px-6 py-8 space-y-6">

      {/* Status */}
      <div className="flex items-center gap-6 w-fit mx-auto">
        <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-2xl ${
          isCompleted ? 'bg-green-500/15 text-green-500' : 'bg-amber-500/15 text-amber-500'
        }`}>
          {isCompleted ? <CheckCircle size={30} /> : <Clock size={30} />}
        </div>
        <div>
          <h2 dir={lang === 'ar' ? 'rtl' : 'ltr'} className="text-xl lg:text-2xl flex items-center justify-center gap-2">
            {isCompleted ? t('orderReadyTitle') : t('orderReceivedTitle')}
          </h2>

          <p className="text-gray-600 mt-1 text-base">
            {t('greeting')} {order.name || order.userName || 'Customer'}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        
        {[
          { label: t('product'), value: order.product || order.productName },
          { 
            label: t('price'), 
            value: (order.paymentMethod?.toLowerCase().includes('vodafone') && order.price) 
              ? `$${order.price} (${order.price * 50} EGP)` 
              : `$${order.price}` 
          },
          { label: t('date'), value: formatDate(order.orderDate), dir: 'ltr' }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-start gap-3">
            <span className="text-primary text-base font-bold">{item.label}</span>
            <span className="text-gray-900 text-base" dir={item.dir}>
              {item.value}
            </span>
          </div>
        ))}

        {/* Status */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center">
          <span className="text-primary text-base font-bold">{t('status')}</span>
          <span className={`flex items-center gap-1 text-sm px-6 py-1.5 rounded-md ${
            isCompleted ? 'bg-green-500/15 text-green-500' : 'bg-amber-500/15 text-amber-500'
          }`}>
            {isCompleted ? t('completed') : t('pending')}
          </span>
        </div>
      </div>


      {/* CTA */}
      {isCompleted && order.fileLink && (
        <div>
          <Link dir='rtl' target="_blank"
            href={getDownloadLink(order.fileLink)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 lg:py-4 rounded-xl font-medium text-base hover:opacity-90 transition shadow-md"
          >
            <Download size={18} />
            {t('download')}
          </Link>

          <p className="text-center text-xs text-gray-600 mt-3">
            {t('downloadText')}
          </p>
        </div>
      )}

      {/* Language Button ONLY */}
      <button dir='rtl' onClick={toggleLanguage} className="w-full flex items-center justify-center gap-2 text-primary py-3 lg:py-4 rounded-xl font-medium text-base hover:opacity-90 transition" >
        <span>{t('languageToggle')}</span> 
      </button>
    </div>
  </div>
);

}
