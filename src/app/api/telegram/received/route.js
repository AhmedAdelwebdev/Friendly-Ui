import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegramId, name, productName } = await request.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const message = `
<b>Friendly UI — Order Received 📥</b>

Hi <b>${name || 'there'}</b>,
We have received your order for:
<b>${productName || 'Digital Product'}</b>.

Your request is currently being reviewed and will be processed within <b>24 hours</b>.

If you have any questions, feel free to contact us Telegram:
@Friendly_Ui

---

<b>Friendly UI — تم استلام الطلب 📥</b>

مرحباً <b>${name || 'بك'}</b>،
لقد استلمنا طلبك لمنتج:
<b>${productName || 'منتج رقمي'}</b>.

طلبك قيد المراجعة حالياً وسيتم تاكيده خلال <b>24 ساعة</b>.

إذا كان لديك أي استفسار، لا تتردد في التواصل معنا عبر حساب التليجرام الخاص بنا تليجرام
@Friendly_Ui
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
