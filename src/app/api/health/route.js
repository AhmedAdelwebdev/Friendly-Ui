import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    airtable: {
      pat: !!process.env.AIRTABLE_PAT,
      base: !!process.env.AIRTABLE_BASE_ID,
      ordersTable: !!process.env.AIRTABLE_ORDERS_TABLE,
      designsTable: !!process.env.AIRTABLE_DESIGNS_TABLE,
    },
    telegram: {
      botToken: !!process.env.TELEGRAM_BOT_TOKEN,
      chatId: !!process.env.TELEGRAM_CHAT_ID,
    },
    payment: {
      vodafone: !!process.env.NEXT_PUBLIC_VODAFONE_NUMBER,
      paypal: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    }
  };

  const missing = [];
  
  if (!checks.airtable.pat) missing.push("Airtable PAT (Private)");
  if (!checks.airtable.base) missing.push("Airtable Base ID (Private)");
  if (!checks.airtable.ordersTable) missing.push("Airtable Orders Table ID (Private)");
  if (!checks.airtable.designsTable) missing.push("Airtable Designs Table ID (Private)");
  
  if (!checks.telegram.botToken) missing.push("Telegram Bot Token (Private)");
  if (!checks.telegram.chatId) missing.push("Telegram Chat ID (Private)");
  
  if (!checks.payment.vodafone) missing.push("Vodafone Cash Number (Public)");
  if (!checks.payment.paypal) missing.push("PayPal Client ID (Public)");

  if (missing.length > 0) {
    return NextResponse.json({
      status: 'error',
      code: 503,
      message: 'Environment configuration incomplete',
      missing: missing,
      details: checks
    }, { status: 503 });
  }

  return NextResponse.json({ status: 'healthy', code: 200 });
}
