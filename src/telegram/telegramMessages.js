export const buildOrderReceivedMessage = (order) => {
  const productName = order.product || order.productName || 'Digital Product';
  return `<b>✨ Order Received</b>

Hi <b>${order.name || order.userName || 'there'}</b>,
We’ve received your order for <b>${productName}</b> and it’s now under review.

We’re currently preparing everything for you and will get back to you within <b>24 hours</b>.

If you have any questions or need help, feel free to reach out anytime:
@Friendly_Ui

— <b>Friendly UI</b>`.trim();
};

export const buildOrderReadyMessage = (order) => {
  const productName = order.product || order.productName || 'Digital Product';
  return `<b>🎉 Your Order is Ready</b>

Hi <b>${order.name || order.userName || 'there'}</b>,
Your order has been successfully completed and is now ready for access.

<b>Product</b>
${productName}

Please click the <b>⬇️ Download</b> button below to access your files from the order page.

If you need any help or have questions, feel free to contact us anytime:
@Friendly_Ui

Thank you for choosing <b>Friendly UI</b>.`.trim();
};
