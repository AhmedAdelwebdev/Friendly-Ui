import { NextResponse } from 'next/server';
import { fetchProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const data = await fetchProducts();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
