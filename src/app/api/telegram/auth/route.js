import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ status: 'waiting' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
       console.error("TELEGRAM_BOT_TOKEN is missing");
       return NextResponse.json({ error: 'System error' }, { status: 500 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.ok && data.result) {
      // Loop backwards to get the most recent message first
      for (let i = data.result.length - 1; i >= 0; i--) {
        const update = data.result[i];
        const msg = update.message || update.edited_message;
        if (msg && msg.text && msg.text.includes(code)) {
          const chatId = msg.chat.id;
          
          // Send confirmation back to user in Telegram (makes it feel bot-driven)
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: 
              `✅ Account Linked Successfully!\n` + 
              `You can now return to the website to complete your purchase.` + 
              `\n----------\n` + 
              `✅ تم ربط الحساب بنجاح!\n` +
              `يمكنك الآن العودة إلى الموقع لإكمال عملية الشراء.`
            })
          }).catch(e => console.error("Confirm msg failed:", e));

          return NextResponse.json({ 
            status: 'success', 
            chatId: chatId,
            firstName: msg.from.first_name || '',
            username: msg.from.username || ''
          });
        }
      }

      // SELF-CLEANING: If the queue is full (100 updates), clear it using the latest update_id as offset
      // This ensures new messages aren't stuck behind old unread updates.
      if (data.result.length >= 100) {
        const lastUpdateId = data.result[data.result.length - 1].update_id;
        fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${lastUpdateId + 1}`).catch(e => console.error("Clean error:", e));
      }
    }
    
    return NextResponse.json({ status: 'waiting' });
  } catch (error) {
    console.error('Telegram auth polling error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
