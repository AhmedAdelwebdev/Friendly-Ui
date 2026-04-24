'use client';

import { useEffect, useState, use } from 'react';
import { getLanguage, setLanguage } from '@/utils/storage';
import { translations, getTranslation } from '@/lang/translations';
import { getDownloadLink, formatDate } from '@/utils/formatters';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { CheckCircle, Clock, XCircle, Download, Globe } from 'lucide-react';
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
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/orders?id=${id}`);
      if (!res.ok) throw new Error('Order not found');
      const foundOrder = await res.json();
      
      let fileUrl = null;
      if (foundOrder.status === 'Completed' || foundOrder.Status === 'Completed') {
        const prodRes = await fetch('/api/products');
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
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key, params) => getTranslation(lang, key, params);

  if (loading) return <LoadingOverlay />;
  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center">
        <XCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <p>The order ID you provided is invalid or the order has been removed.</p>
      </div>
    </div>
  );

  const isCompleted = (order.status || '').toLowerCase() === 'completed';

  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12 ${lang === 'ar' ? 'font-tajawal' : 'font-sans'}`}>
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="bg-primary/5 p-6 sm:p-8 flex items-center justify-between border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              {isCompleted ? <CheckCircle size={24} /> : <Clock size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {isCompleted ? t('orderReadyTitle') : t('orderReceivedTitle')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('greeting')} {order.userName || order.name || 'Customer'}
              </p>
            </div>
          </div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shrink-0"
          >
            <Globe size={16} />
            {t('languageToggle')}
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-gray-600 leading-relaxed text-[15px]">
            {isCompleted 
              ? t('readyText') 
              : t('receivedText', { product: order.product || order.productName || 'Digital Product' })}
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 text-sm">{t('product')}</span>
              <span className="font-semibold text-gray-900 text-right">{order.product || order.productName}</span>
            </div>
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 text-sm">{t('status')}</span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                {isCompleted ? t('completed') : t('pending')}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-500 text-sm">{t('price')}</span>
              <span className="font-medium text-gray-900">${order.price}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">{t('date')}</span>
              <span className="text-sm text-gray-900 text-right" dir="ltr">
                {formatDate(order.orderDate)}
              </span>
            </div>
          </div>

          {isCompleted && order.fileLink && (
            <div className="pt-2">
              <Link 
                href={getDownloadLink(order.fileLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
              >
                <Download size={20} />
                {t('download')}
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">
                {t('downloadText')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-2">{t('helpText')}</p>
          <a href="https://t.me/Friendly_Ui" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
            @Friendly_Ui
          </a>
          <div className="mt-4 text-xs text-gray-400">
            {t('thanks')} <span className="font-semibold text-gray-600">{t('brand')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
