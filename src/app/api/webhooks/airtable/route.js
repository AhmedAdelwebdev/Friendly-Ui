import { NextResponse } from 'next/server';

/**
 * Airtable Webhook Listener
 * Call this URL from Airtable Automations when an order status changes.
 * URL: https://your-domain.com/api/webhooks/airtable
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, status, userName, product } = body;

    if (status?.toLowerCase() === 'completed' || status?.toLowerCase() === 'confirmed') {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      const message = `✅ <b>Order Approved</b>\n\n` +
                      `<b>Customer:</b> ${userName}\n` +
                      `<b>Product:</b> ${product}\n` +
                      `<b>Order ID:</b> <code>${orderId}</code>\n\n` +
                      `<i>The customer has been notified on the website and can now access their files.</i>`;

      // Notify the Admin (or Customer if chatID is known)
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      return NextResponse.json({ success: true, message: 'Notification sent' });
    }

    return NextResponse.json({ success: true, message: 'No action taken' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
