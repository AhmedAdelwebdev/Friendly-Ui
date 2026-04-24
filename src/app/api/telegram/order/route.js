import { NextResponse } from 'next/server';
import { sendTelegramOrderMessage } from '@/telegram/telegramActions';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, telegramId, name, contact, productName, orderId, order = {}, fileLink } = body;

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }

    if (type === 'received') {
      await sendTelegramOrderMessage(telegramId, 'received', { name, productName, contact }, null, orderId);
    } else if (type === 'ready') {
      if (!fileLink) {
        return NextResponse.json({ error: 'Missing fileLink for ready status' }, { status: 400 });
      }
      await sendTelegramOrderMessage(telegramId, 'ready', order, fileLink, orderId);
    } else {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Telegram Notification API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}
