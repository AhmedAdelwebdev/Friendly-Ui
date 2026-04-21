'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePayment } from '@/lib/PaymentContext';
import { useOrders } from '@/lib/CartContext';
import { X, CheckCircle, Upload, ChevronRight, Copy, Check, ArrowRight, MessageSquare, Globe } from 'lucide-react';
import { PayPalButtons } from "@paypal/react-paypal-js";
import Link from 'next/link';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const EGP_RATE = 50; // 1 USD = 60 EGP
const PAYPAL_AVAILABLE = process.env.NEXT_PUBLIC_PAYPAL_AVAILABLE === 'on' || false;

const generateOrderId = (prefix = 'ID') => {
  const date = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}_${date}_${random}`.toUpperCase();
};

const escapeHTML = (str) => {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};



export const PaymentModal = () => {
  const { activeItem, isPaymentOpen, closePayment } = usePayment();
  const { addOrder, setIsOrdersOpen } = useOrders();

  // 0: Telegram Auth, 1: Info, 2: Method, 3: Process/Success
  const [step, setStep] = useState(0);

  const [userInfo, setUserInfo] = useState({ name: '', contact: '' });
  const [telegramId, setTelegramId] = useState(null);
  const [telegramCode, setTelegramCode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [status, setStatus] = useState('idle');
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [analyzingOCR, setAnalyzingOCR] = useState(false);
  const [lang, setLang] = useState('EN');
  const [copiedType, setCopiedType] = useState(null); // 'start' or 'command'

  const pollIntervalRef = useRef(null);

  // Basic URL replacement if missing
  const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'FriendlyUiBot';

  useEffect(() => {
    if (isPaymentOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;

      // Load saved user info
      const savedInfo = localStorage.getItem('friendly_userInfo');
      if (savedInfo) {
        try { setUserInfo(JSON.parse(savedInfo)); } catch (e) { }
      }

      // Check Telegram Auth Step
      const savedTgId = localStorage.getItem('friendly_telegram_chat_id');
      if (savedTgId) {
        setTelegramId(savedTgId);
        setTelegramCode(savedTgId); // Use ID as code for re-linking if needed
        setStep(1); // skip to info
      } else {
        // Try to get existing code from localStorage to survive refreshes
        let code = localStorage.getItem('friendly_telegram_auth_code');
        if (!code) {
          code = 'AUTH_' + Math.random().toString(36).substring(2, 8).toUpperCase();
          localStorage.setItem('friendly_telegram_auth_code', code);
        }
        setTelegramCode(code);
        setStep(0);
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isPaymentOpen]);

  // Polling for Telegram Authentication
  useEffect(() => {
    if (step === 0 && telegramCode && isPaymentOpen) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/telegram/auth?code=${telegramCode}`);
          const data = await res.json();
          if (data.status === 'success' && data.chatId) {
            clearInterval(pollIntervalRef.current);
            localStorage.setItem('friendly_telegram_chat_id', data.chatId.toString());
            localStorage.removeItem('friendly_telegram_auth_code'); // Clean up code
            setTelegramId(data.chatId.toString());
            if (data.firstName) {
              setUserInfo(prev => ({ ...prev, name: prev.name || data.firstName }));
            }
            setTimeout(() => setStep(1), 1000); // go to step 1 after brief success
          }
        } catch (e) {
          console.error('Polling fail', e);
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [step, telegramCode, isPaymentOpen]);

  if (!isPaymentOpen || !activeItem) return null;

  const priceUSD = activeItem.price || 0;
  const priceEGP = (priceUSD * EGP_RATE);

  const reset = () => {
    setPaymentMethod(null);
    setStatus('idle');
    setScreenshot(null);
    setError('');
    const hasTg = localStorage.getItem('friendly_telegram_chat_id');
    setStep(hasTg ? 1 : 0);
  };

  const handleNextStep = () => {
    localStorage.setItem('friendly_userInfo', JSON.stringify(userInfo));
    setStep(2);
  };

  const handleClose = () => {
    reset();
    closePayment();
  };

  // Helper for text direction
  const isAr = lang === 'AR';
  const txIsAr = (en, ar) => isAr ? ar : en;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Core Payment logic (same OCR logic + Telegram notify instead of email logic)
  const sendTelegramNotification = async (data) => {
    try {
      const orderId = data.orderId;
      const method = data.method || paymentMethod;
      const isAttempt = data.status?.includes('Attempting');

      const message = (isAttempt ? `⭐ <b>Payment Attempt</b>` : `😎 <b>New Order Received</b>`) +
        `\nCustomer` +
        `• Name: ${escapeHTML(userInfo.name)}` +
        `• Contact: ${userInfo.contact}\n` +
        `Order Details` +
        `• Product: ${escapeHTML(activeItem.title)}` +
        `• Price: $${Number(activeItem.price)} (${priceEGP} EGP)` +
        `• Method: ${method?.toUpperCase()}` + (!isAttempt &&
        `• Order ID: <code>${orderId}</code>`);

      const formData = new FormData();
      formData.append('message', message);
      if (screenshot) formData.append('photo', screenshot);

      await fetch('/api/notify', {
        method: 'POST',
        body: formData
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }
  };

  const startPaymentAttempt = (method) => {
    setPaymentMethod(method);
    setStep(3);
    sendTelegramNotification({
      status: `Attempting Payment`,
      method: method,
      orderId: 'ATT-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    });
  };

  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;

          // 1. Draw original
          ctx.drawImage(img, 0, 0);

          // 2. Simple high contrast grayscale filter
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Threshold: Make it stark black and white
            const v = avg > 128 ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = v;
          }
          ctx.putImageData(imageData, 0, 0);

          canvas.toBlob(resolve, 'image/png');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const verifyScreenshot = async (file) => {
    try {
      const Tesseract = await import('tesseract.js');

      // Pre-process for better visibility
      const processedBlob = await preprocessImage(file);
      const { data: { text } } = await Tesseract.recognize(processedBlob, 'eng+ara');

      const fullText = text.toLowerCase();
      const normalizedText = fullText.replace(/[\s\-\*\#\(\)]/g, '');
      const targetNumber = process.env.NEXT_PUBLIC_VODAFONE_NUMBER || '01044197802';
      const pStr = priceEGP.toString();

      const payKeywords = ['instapay', 'successful', 'paid', 'transfer', 'vodafone', 'cash', 'vfs', 'تحويل', 'بنجاح', 'ناجحة', 'تمت', 'جنيه', 'egp', 'معاملة', 'رصيدك', 'مبلغ', 'مصاريف'];
      const hasPayKeyword = payKeywords.some(k => fullText.includes(k));

      const isVodafoneUSSD = fullText.includes('9*7') || normalizedText.includes('97010') || normalizedText.includes('97011') || normalizedText.includes('97012') || normalizedText.includes('97015');

      const amountRegex = /\d+/g;
      const parsedNumbers = (fullText.match(amountRegex) || []).map(n => parseInt(n));

      // 1. Direct Match
      let priceMatch = parsedNumbers.some(num => Math.abs(num - priceEGP) < 2) || normalizedText.includes(pStr);

      // 2. Fuzzy Match
      if (!priceMatch) {
        const fuzzyPricePattern = pStr.replace(/1/g, '[1li!|]').replace(/0/g, '[0o]').replace(/2/g, '[2z]').replace(/5/g, '[5s]').replace(/8/g, '[8b]');
        const regex = new RegExp(fuzzyPricePattern);
        priceMatch = regex.test(normalizedText) || regex.test(fullText);
      }

      // 3. Special Case: Partial match for USSD popups (if it sees 40 instead of 1140 but everything else is perfect)
      if (!priceMatch && isVodafoneUSSD && pStr.length >= 3) {
        const suffix = pStr.slice(-2);
        if (fullText.includes(suffix) || normalizedText.includes(suffix)) {
          console.warn('Partial price match on USSD detected.');
          priceMatch = true;
        }
      }

      const phoneMatch = normalizedText.includes(targetNumber) ||
        normalizedText.includes(targetNumber.slice(1)) ||
        parsedNumbers.some(num => num.toString().includes(targetNumber.slice(-8)));

      const isValid = priceMatch && (phoneMatch || hasPayKeyword || isVodafoneUSSD);

      console.group('Ultra-OCR Debugging');
      console.log('Detected Text:', fullText);
      console.log('Normalized:', normalizedText);
      console.log('Price Match:', priceMatch);
      console.log('Phone Match:', phoneMatch);
      console.groupEnd();

      return { isValid, detectedAmount: priceMatch ? priceEGP : 0 };
    } catch (err) {
      console.error('OCR Error:', err);
      return { isValid: false, detectedAmount: 0 };
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScreenshot(file);
    setError('');
    setAnalyzingOCR(true);

    const verification = await verifyScreenshot(file);
    setAnalyzingOCR(false);

    if (!verification.isValid) {
      setScreenshot(null);
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);

      setError(txIsAr(
        newFails >= 3
          ? 'Verification failed multiple times. Please send your receipt via Telegram for manual approval.'
          : `Invalid Receipt: Could not detect a valid ${priceEGP} EGP transfer. Please try re-uploading or use a different screenshot.`,
        newFails >= 3
          ? 'فشل التحقق عدة مرات. يرجى إرسال الإيصال عبر تليجرام للمراجعة اليدوية.'
          : `إيصال غير صالح: لم يتم اكتشاف تحويل بقيمة ${priceEGP} جنيه. يرجى إعادة رفع الصورة أو تجربة لقطة شاشة أخرى.`
      ));
      if (newFails >= 3) setShowWhatsApp(true);
      return;
    }
    setStatus('idle');
  };

  const handleVodafoneSubmit = async () => {
    if (!screenshot) {
      setError(txIsAr('Please upload a screenshot of the payment.', 'يرجى إرفاق صورة الدفع'));
      return;
    }
    setError('');
    setStatus('processing');

    const verification = await verifyScreenshot(screenshot);

    if (!verification.isValid) {
      setStatus('idle');
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);

      setError(txIsAr(
        newFails >= 3
          ? 'Verification failed multiple times. Please use Telegram to complete your order.'
          : `Invalid screenshot (${newFails}/3). Please re-upload or try another one.`,
        newFails >= 3
          ? 'فشل التحقق عدة مرات. يرجى استخدام تليجرام لإكمال طلبك.'
          : `إيصال غير صالح (${newFails}/3). يرجى إعادة الرفع أو تجربة إيصال آخر.`
      ));
      if (newFails >= 3) setShowWhatsApp(true);
      return;
    }

    const orderId = generateOrderId('VC');

    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          name: userInfo.name,
          contact: userInfo.contact,
          telegramId: telegramId,
          productId: activeItem.id,
          productName: activeItem.title,
          priceUSD: Number(activeItem.price),
          priceEGP: Number(priceEGP),
          paymentMethod: 'vodafone',
          productImage: activeItem.image
        })
      });
      const data = await resp.json();
      const finalId = data._recordId || data.id || orderId;

      // Notify Admin
      sendTelegramNotification({
        status: 'Awaiting Verification',
        orderId: finalId
      });

      // Notify Customer (Pending Message)
      fetch('/api/telegram/received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          name: userInfo.name,
          contact: userInfo.contact,
          productName: activeItem.title
        })
      }).catch(e => console.error('Customer notification failed:', e));

      setStatus('success');
      addOrder(activeItem, { id: finalId, status: 'pending' });
    } catch (err) {
      setError(`Failed: ${err.message}`);
      setStatus('idle');
    }
  };

  const handlePayPalSuccess = async (details) => {
    setStatus('success');
    const orderId = details.id || generateOrderId('PP');

    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          name: userInfo.name,
          contact: userInfo.contact,
          telegramId: telegramId,
          productId: activeItem.id,
          productName: activeItem.title,
          priceUSD: Number(activeItem.price),
          priceEGP: Number(priceEGP),
          paymentMethod: 'paypal',
          productImage: activeItem.image,
          status: 'Completed',
          confirmedDate: new Date().toISOString()
        })
      });

      const data = await resp.json();
      const finalId = data._recordId || data.id || orderId;

      await sendTelegramNotification({
        status: 'Paid via PayPal (Auto-Approved)',
        orderId: finalId
      });

      addOrder(activeItem, {
        id: finalId,
        status: 'completed',
        fileLink: activeItem.fileLink
      });

      // Auto-deliver via Telegram for PayPal
      await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId,
          order: { name: userInfo.name, productName: activeItem.title, contact: userInfo.contact },
          fileLink: activeItem.fileLink
        })
      });

    } catch (err) {
      console.error("Failed to post paypal order details");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto max-h-screen bg-black/70 backdrop-blur-md p-4 sm:p-8 font-sans">
      <div className="absolute inset-0" />

      <div className="bg-body max-w-lg sm:max-w-3xl overflow-y-auto max-h-screen relative w-full h-full sm:h-fit mx-auto rounded-xl sm:rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="flex-1 p-6 lg:p-10 relative flex flex-col w-full">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex-1 flex items-center gap-2">
              {[0, 1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-white/30'}`} />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setLang(l => l === 'EN' ? 'AR' : 'EN')}
                className="w-10 py-1.5 bg-gray-100 hover:bg-gray-200 text-base sm:text-xs text-gray-700 flex items-center gap-1.5 font-bold uppercase tracking-wider"
              >
                <Globe size={14} className="shrink-0" /> {lang}
              </button>

              <button
                onClick={handleClose}
                className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all border border-black/5 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[50vh] max-w-sm w-full mx-auto sm:max-w-none sm:mx-0">
            {analyzingOCR && (
              <LoadingOverlay type="ocr" message={txIsAr('AI Analyzing', 'جاري تحليل الصورة')} />
            )}

            {status === 'processing' && (
              <LoadingOverlay type="upload" message={txIsAr('Almost There', 'لحظات من فضلك')} />
            )}

            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 p-2">
                <div className="text-green-500 mb-6">
                  <CheckCircle size={40} strokeWidth={2.5} className="animate-in zoom-in duration-700 delay-300" />
                </div>
                <h2 className="text-2xl text-gray-900 mb-2">{txIsAr('Request Sent', 'تم إرسال الطلب')}</h2>
                <p className="text-gray-500 mb-8 max-w-sm text-sm leading-relaxed">
                  {txIsAr('Excellent work! Check your Telegram shortly for the files.', 'ممتاز! تم استلام طلبك. يرجى مراجعة تليجرام الخاص بك.')}
                </p>
                <div className="w-full max-w-xs space-y-2.5">
                  <button onClick={() => { handleClose(); setTimeout(() => setIsOrdersOpen(true), 300); }} className="w-full bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all shadow-lg">
                    {txIsAr('Go to My Collection', 'الذهاب إلى طلباتي')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {step === 0 && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500 flex flex-col items-center justify-center text-center py-2">
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6 text-primary">
                      <p className="text-sm font-medium">
                        {txIsAr('Follow these 3 steps to link your account:', 'اتبع هذه الخطوات الثلاث لربط حسابك:')}
                      </p>
                    </div>

                    <div className="w-full max-w-sm space-y-6 mb-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                        <p className="text-sm text-gray-600 leading-relaxed pt-1">
                          {txIsAr('Click the "Connect Telegram" button below to open the website, not app.', 'اضغط على زر "ربط حساب تليجرام" أدناه ليفتح لك الموقع , وليس التطبيق.')}
                        </p>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">2</div>
                        <div className="flex-1 space-y-3">
                          <p className="text-sm text-gray-600 leading-relaxed pt-1">
                            {txIsAr('Press the ', 'بمجرد فتح التطبيق، اضغط على زر ')}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary mx-1">START</span>
                            {txIsAr(' button or copy/paste this command: ', ' أو انسخ هذا الكود والصقه: ')}
                          </p>
                          <button
                            onClick={() => handleCopy(`/start ${telegramCode}`, 'command')}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl font-bold transition-all ${copiedType === 'command' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                          >
                            <span className="text-[11px] font-mono tracking-wider">/start {telegramCode}</span>
                            {copiedType === 'command' ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">3</div>
                        <p className="text-sm text-gray-600 leading-relaxed pt-1">
                          {txIsAr('Wait for the connection to happen automatically, then return here.', 'انتظر ثوانٍ حتى يتم الربط تلقائياً، ثم ارجع هنا للموقع.')}
                        </p>
                      </div>
                    </div>

                    {telegramId ? (
                      <>
                        <div className="w-full max-w-sm p-4 text-green-600 rounded-xl border border-border mb-4 animate-in fade-in flex items-center justify-center gap-2">
                          <CheckCircle size={18} /> {txIsAr('Connected successfully', 'تم الربط بنجاح')}
                        </div>
                        <button onClick={() => setTelegramId("")} className="w-full px-2 text-gray-400 rounded-xl mb-4 animate-in fade-in flex items-center justify-center gap-2">
                          {txIsAr('Re-connect to Telegram', 'اعاده ربط التليجرام')}
                        </button>
                      </>
                    ) : (
                      <Link href={`https://t.me/${BOT_USERNAME}?start=${telegramCode}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-full max-w-sm flex items-center justify-center gap-2 bg-[#0088cc] text-white py-4 px-6 rounded-2xl shadow-lg shadow-[#0088cc]/20 hover:bg-[#0077b3] transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MessageSquare size={18} />
                        {txIsAr('Connect Telegram Account', 'ربط حساب تليجرام')} <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
                      </Link>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                    <h3 className="text-xl text-gray-900 mb-5">{txIsAr('Personalize Order', 'تخصيص الطلب')}</h3>
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 *:grow *:space-y-2.5">
                        <div>
                          <label className={`text-sm text-gray-600 capitalize block ${isAr ? 'mr-1' : 'ml-1'}`}>{txIsAr('Full Name', 'الاسم الكامل')}</label>
                          <input type="text"
                            value={userInfo.name || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-primary/20 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 shadow-sm"
                            placeholder={txIsAr('What is your name?', 'ما هو اسمك ؟')}
                          />
                        </div>
                        <div>
                          <label className={`text-sm text-gray-600 capitalize block ${isAr ? 'mr-1' : 'ml-1'}`}>{txIsAr('Telegram accont or Email', 'حساب تليجرام او الايميل')}</label>
                          <input type="text"
                            value={userInfo.contact || ''}
                            onChange={(e) => setUserInfo({ ...userInfo, contact: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50/50 border-2 border-primary/20 rounded-xl focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 shadow-sm"
                            placeholder={txIsAr('@ Telegram', '@ حساب تليجرام')}
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleNextStep}
                          disabled={!(userInfo.name && userInfo.contact)}
                          className="w-full bg-primary text-white py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                          {txIsAr('Continue to Methods', 'المتابعة لطرق الدفع')} <ArrowRight size={18} className={isAr ? 'rotate-180' : ''} />
                        </button>
                        <button onClick={() => setStep(0)} className="mt-4 text-xs mx-auto text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                          {txIsAr('Back to Telegram', 'الرجوع للتليجرام')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                    <h3 className="text-xl text-gray-900 mb-6">{txIsAr('Choose Method', 'اختر طريقة الدفع')}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {PAYPAL_AVAILABLE && (
                        <button onClick={() => startPaymentAttempt('paypal')} className={`group p-4 border-2 border-gray-100 dark:border-white/5 rounded-xl hover:border-primary/30 dark:hover:border-primary! hover:bg-gray-50 dark:hover:bg-primary/20 transition-all text-left flex items-center justify-between rtl:text-right`}>
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-10 h-10 bg-white! dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center transition-transform shadow-sm">
                              <Image src="/paypal.svg" className="size-full" width={40} height={40} alt="" />
                            </div>
                            <div>
                              <p className="text-gray-900 text-sm">{txIsAr('Pay with PayPal', 'الدفع بواسطة بايبال')}</p>
                              <p className="text-sm text-blue-500 mt-0.5">{txIsAr('Instant delivery', 'تسليم فوري')}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-300" />
                        </button>
                      )}

                      <button onClick={() => startPaymentAttempt('vodafone')} className="group p-4 border-2 border-gray-100 dark:border-white/5 rounded-xl hover:border-primary/30 dark:hover:border-primary! hover:bg-gray-50 dark:hover:bg-primary/20 transition-all text-left flex items-center justify-between rtl:text-right">
                        <div className="flex items-center gap-4 w-full">
                          <div className="w-10 h-10 bg-white! dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center transition-transform shadow-sm">
                            <Image src="/vodafone.svg" className="size-full" width={40} height={40} alt=""></Image>
                          </div>                          <div>
                            <p className="text-gray-900 text-sm">{txIsAr('Vodafone Cash', 'فودافون كاش')}</p>
                            <p className="text-sm text-red-500 mt-0.5">{txIsAr('Manual Approval', 'مراجعة يدوية')}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </button>

                      <button onClick={() => setStep(1)} className="mt-3 text-xs text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2">
                        {txIsAr('Back to info', 'الرجوع للمعومات')}
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && paymentMethod === 'paypal' && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500">
                    <h3 className="text-xl text-gray-900 mb-6">{txIsAr('Pay Securely', 'ادفع بأمان')}</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border border-black/5 min-h-[200px] flex flex-col justify-center mb-4">
                      <PayPalButtons
                        style={{ layout: "vertical", shape: "pill", label: 'pay' }}
                        createOrder={(d, actions) => actions.order.create({ purchase_units: [{ amount: { currency_code: "USD", value: Number(priceUSD) } }] })}
                        onApprove={(d, actions) => actions.order.capture().then(handlePayPalSuccess)}
                        onError={() => setError('Gateway timeout.')}
                      />
                    </div>
                    <button onClick={() => setStep(2)} className="w-full text-xs text-gray-600 text-center hover:text-gray-900">{txIsAr('Choose another method', 'اختر طريقة أخرى')}</button>
                  </div>
                )}

                {step === 3 && paymentMethod === 'vodafone' && (
                  <div className="animate-in fade-in slide-in-from-right-10 duration-500 w-full mx-auto space-y-4">

                    {/* TOP ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {/* Amount */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <p className="text-sm text-gray-600 capitalize mb-1">
                          {txIsAr('Amount to Transfer', 'المبلغ المطلوب تحويله')}
                        </p>
                        <h3 className="text-xl font-medium text-primary">
                          {priceEGP} <span className="text-xs">EGP</span>
                        </h3>
                      </div>

                      {/* Number */}
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col justify-between">
                        <p className="text-sm text-gray-600 capitalize">
                          {txIsAr('Target Number', 'الرقم المحول إليه')}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm tracking-wider" style={{ direction: 'ltr' }}>
                            01044197802
                          </span>

                          <button
                            onClick={() => navigator.clipboard.writeText('01044197802')}
                            className="text-primary text-xs hover:underline"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* UPLOAD */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 capitalize">
                        {txIsAr('Upload Receipt', 'رفع إيصال الدفع')}
                      </label>

                      <input
                        type="file"
                        id="final_screenshot"
                        hidden
                        onChange={handleImageUpload}
                        accept="image/*"
                      />

                      <label
                        htmlFor="final_screenshot"
                        className="mt-4 flex items-center justify-between w-full p-4 border border-dashed border-gray-400 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        {screenshot ? (
                          <>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Check size={16} className="text-green-500 shrink-0" />
                              <p className="text-xs text-gray-700 truncate max-w-[140px]">
                                {screenshot.name}
                              </p>
                            </div>
                            <span className="text-sm text-primary whitespace-nowrap">
                              {txIsAr('Click to change', 'اضغط للتغيير')}
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Upload size={16} />
                            <p className="text-xs">{txIsAr('Select Screenshot', 'اختر لقطة الشاشة')}</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* ERROR */}
                    {error && (
                      <div className="text-red-500 text-[11px] text-center">
                        {error}
                      </div>
                    )}

                    {/* ACTION */}
                    {showWhatsApp ? (
                      <a
                        href={`https://t.me/Friendly_Ui?text=I have an issue with my order. My Telegram ID is: ${telegramId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#0088cc] text-white py-4 rounded-xl text-sm font-bold shadow-lg shadow-[#0088cc]/20 hover:scale-[1.02] transition-all"
                      >
                        <MessageSquare size={18} />
                        {txIsAr('Chat via Telegram (Support)', 'التحدث عبر تليجرام (دعم فني)')}
                      </a>
                    ) : (
                      <button
                        disabled={status === 'processing' || !screenshot}
                        onClick={handleVodafoneSubmit}
                        className="w-full bg-primary text-white py-2.5 rounded-lg text-sm disabled:opacity-30"
                      >
                        {status === 'processing' ? txIsAr('Verifying Screenshot...', 'جاري فحص الإيصال...') : txIsAr('Confirm Order', 'تأكيد الطلب')}
                      </button>
                    )}

                    {/* BACK */}
                    <button
                      onClick={() => setStep(2)}
                      className="w-full text-[11px] text-gray-600 hover:text-gray-700"
                    >
                      {txIsAr('Choose another method', 'اختر طريقة أخرى')}
                    </button>

                  </div>
                )}

              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
