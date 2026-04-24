import { NextResponse } from 'next/server';
import { logErrorToTelegram } from '@/lib/logError';

export async function POST(request) {
  try {
    const { error, context, stack } = await request.json();

    // We pass a mock error object to logErrorToTelegram
    await logErrorToTelegram({ message: error, stack }, `Frontend: ${context}`);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
