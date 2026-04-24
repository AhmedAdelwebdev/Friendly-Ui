// In-memory cache to prevent spamming identical errors (TTL: 1 minute)
const errorCache = new Map();
let lastBatchTime = 0;
const GLOBAL_RATE_LIMIT_MS = 2000; // Minimum 2 seconds between ANY two messages to Telegram

export async function logErrorToTelegram(error, context = 'Unknown') {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const errorMsg = error?.message || error || 'Unknown Error';
  const cacheKey = `${context}:${errorMsg}`;
  const now = Date.now();

  // 1. De-duplication: Skip if same error was sent in the last 60 seconds
  if (errorCache.has(cacheKey)) {
    const lastSeen = errorCache.get(cacheKey);
    if (now - lastSeen < 60000) {
      console.log(`[Rate Limit] Skipping duplicate error: ${cacheKey}`);
      return;
    }
  }

  // 2. Global Throttling: Ensure we don't hit Telegram's 30/sec limit across all requests
  // This is a simple defensive check for bursts
  if (now - lastBatchTime < GLOBAL_RATE_LIMIT_MS) {
    console.log(`[Rate Limit] Throttling Telegram message for stability.`);
    // We wait a bit or just skip if it's too fast (for errors, skipping is safer than crashing)
    await new Promise(resolve => setTimeout(resolve, GLOBAL_RATE_LIMIT_MS));
  }

  const message = `🚨 <b>New Error Detected</b>
\n<b>Context:</b> ${context}
<b>Error:</b> <code>${errorMsg}</code>
\n<b>Stack:</b> <code>${error?.stack?.substring(0, 300) || 'N/A'}</code>
<b>Time:</b> ${new Date().toLocaleString()}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (res.ok) {
      errorCache.set(cacheKey, now);
      lastBatchTime = Date.now();
    }
  } catch (e) {
    console.error('Failed to send error to Telegram:', e);
  }
}
