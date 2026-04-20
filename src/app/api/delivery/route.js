import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { telegramId, order, fileLink } = await request.json();
    
    // Check authentication
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token !== 'google_authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!telegramId || !fileLink) {
      return NextResponse.json({ error: 'Missing telegramId or fileLink' }, { status: 400 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    const getDownloadLink = (link) => {
      if (!link) return '#';
      if (link.includes('drive.google.com')) {
        const match = link.match(/\/d\/(.*?)\//);
        const fileId = match?.[1];

        if (fileId) {
          return `https://drive.google.com/uc?export=download&id=${fileId}`;
        }
      }
      return link;
    };

    const message = `
<b>✅ Friendly UI — Order Complete</b>

Hi <b>${order.name || 'there'}</b>,  
Your order has been processed successfully and everything is ready.

<b>Product</b>  
${order.productName || 'Digital Product'}

<b>Download</b>  
${getDownloadLink(fileLink)}

You can access your files anytime using the link above.

---

<b>✅ Friendly UI — تم تنفيذ الطلب</b>

مرحباً <b>${order.name || 'بك'}</b>،  
تم تنفيذ طلبك بنجاح وكل حاجة جاهزة الآن.

<b>المنتج</b>  
${order.productName || 'منتج رقمي'}

<b>رابط التحميل</b>  
${getDownloadLink(fileLink)}

يمكنك تحميل الملفات في أي وقت من خلال الرابط بالأعلى.

Thank you for choosing <b>Friendly UI</b>
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
      console.error('Failed delivery:', err);
      return NextResponse.json({ error: 'Telegram fail' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delivery error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
