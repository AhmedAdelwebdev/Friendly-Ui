export const translations = {
  en: {
    orderReceivedTitle: "Order Received",
    orderReadyTitle: "Your Order is Ready",
    greeting: "Hi",
    receivedText: "We’ve received your order for {product} and it’s now under review. We’re currently preparing everything for you and will get back to you within 24 hours.",
    readyText: "Your order has been successfully completed and is now ready for access.",
    product: "Product",
    download: "Download",
    downloadText: "You can use this link anytime to access your files.",
    helpText: "If you have any questions or need help, feel free to reach out anytime:",
    thanks: "Thank you for choosing",
    brand: "Friendly UI",
    viewOrder: "View Order Details",
    status: "Status",
    date: "Date",
    price: "Price",
    paymentMethod: "Payment Method",
    pending: "Under Review",
    completed: "Completed",
    failed: "Failed",
    languageToggle: "الترجمة الي لعربية",
  },
  ar: {
    orderReceivedTitle: "تم استلام طلبك",
    orderReadyTitle: "طلبك جاهز الآن",
    greeting: "مرحباً",
    receivedText: "لقد استلمنا طلبك لمنتج {product} وهو الآن قيد المراجعة. نقوم حالياً بتجهيز كل شيء وسنرد عليك خلال 24 ساعة.",
    readyText: "تم إكمال طلبك بنجاح وهو الآن جاهز للاستخدام.",
    product: "المنتج",
    download: "تحميل",
    downloadText: "يمكنك استخدام هذا الرابط في أي وقت للوصول إلى ملفاتك.",
    helpText: "إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا في أي وقت:",
    thanks: "شكراً لاختيارك",
    brand: "Friendly UI",
    viewOrder: "عرض تفاصيل الطلب",
    status: "الحالة",
    date: "التاريخ",
    price: "السعر",
    paymentMethod: "طريقة الدفع",
    pending: "قيد المراجعة",
    completed: "مكتمل",
    failed: "فشل",
    languageToggle: "Translate To English",
  }
};

export const getTranslation = (lang, key, params = {}) => {
  let text = translations[lang]?.[key] || translations['en'][key] || key;
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  return text;
};
