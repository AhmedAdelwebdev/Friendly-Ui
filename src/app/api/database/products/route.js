import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/data';
import { logErrorToTelegram } from '@/lib/logError';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!process.env.AIRTABLE_PAT || !process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json({ error: 'Backend Configuration Missing', code: 'CONFIG_ERROR' }, { status: 503 });
  }
  try {
    const data = await fetchProducts();
    return NextResponse.json(data);
  } catch (error) {
    await logErrorToTelegram(error, 'GET /api/products');
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
