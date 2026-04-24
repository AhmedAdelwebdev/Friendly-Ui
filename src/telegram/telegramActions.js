import { buildOrderReceivedMessage, buildOrderReadyMessage } from './telegramMessages';
import { getDownloadLink } from '../utils/formatters';

export const sendTelegramOrderMessage = async (chatId, type, order, fileLink = null, orderId = null) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) throw new Error('System configuration error: Missing Telegram Token');

  let text = '';
  if (type === 'received') {
    text = buildOrderReceivedMessage(order);
  } else if (type === 'ready') {
    text = buildOrderReadyMessage(order, getDownloadLink(fileLink));
  } else {
    throw new Error('Invalid message type');
  }

  const reply_markup = { inline_keyboard: [] };

  if (orderId) {
    let urlBase = process.env.NEXT_PUBLIC_APP_URL || 'https://friendlyui.vercel.app';
    if (urlBase.includes('localhost')) {
      urlBase = 'https://friendlyui.vercel.app'; // Telegram API rejects localhost URLs
    }
    reply_markup.inline_keyboard.push([
      { text: '🔍 View Order Details', url: `${urlBase}/order/${orderId}` }
    ]);
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: reply_markup
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Telegram API error:', err);
    throw new Error('Telegram fail');
  }

  return true;
};
