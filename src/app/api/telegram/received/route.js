import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegramId, name = 'there', productName = 'Digital Product' } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

const message = `
<b>✨ Order Received</b>

Hi <b>${name || 'there'}</b>,
We’ve received your order for <b>${productName || 'Digital Product'}</b> and it’s now under review.

We’re currently preparing everything for you and will get back to you within <b>24 hours</b>.

If you have any questions or need help, feel free to reach out anytime:
@Friendly_Ui

— <b>Friendly UI</b>
`.trim();


    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Telegram API error:', err);
      return NextResponse.json({ error: 'Telegram fail' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Received API error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
