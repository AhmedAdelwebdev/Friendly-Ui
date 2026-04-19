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

    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const data = await res.json();
    
    if (data.ok && data.result) {
      // Loop backwards to get the most recent message first
      for (let i = data.result.length - 1; i >= 0; i--) {
        const update = data.result[i];
        if (update.message && update.message.text === `/start ${code}`) {
          return NextResponse.json({ 
            status: 'success', 
            chatId: update.message.chat.id,
            firstName: update.message.from.first_name || 'User'
          });
        }
      }
    }
    
    return NextResponse.json({ status: 'waiting' });
  } catch (error) {
    console.error('Telegram auth polling error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
