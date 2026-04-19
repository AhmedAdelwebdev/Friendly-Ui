import { NextResponse } from 'next/server';

const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;
  const limits = rateLimit.get(ip) || [];
  const validLimits = limits.filter(t => t > windowStart);
  if (validLimits.length >= 5) return false; // Max 5 notifications per minute
  validLimits.push(now);
  rateLimit.set(ip, validLimits);
  return true;
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const message = formData.get('message');
    const photo = formData.get('photo');
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: 'Telegram configuration is missing' }, { status: 500 });
    }

    let url;
    let finalBody;
    let headers = {};

    if (photo) {
      url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
      const tgFormData = new FormData();
      tgFormData.append('chat_id', TELEGRAM_CHAT_ID);
      tgFormData.append('photo', photo);
      tgFormData.append('caption', message);
      tgFormData.append('parse_mode', 'HTML');
      finalBody = tgFormData;
    } else {
      url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      finalBody = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      });
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: finalBody
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Telegram API Error:', errorText);
      return NextResponse.json({ error: 'Failed to send telegram message', details: errorText }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notify route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
