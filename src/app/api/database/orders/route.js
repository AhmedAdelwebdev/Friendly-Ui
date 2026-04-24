import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRecords, createRecord, getTableFields } from '@/lib/airtable';
import { logErrorToTelegram } from '@/lib/logError';

const rateLimit = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - 60000;
  const limits = rateLimit.get(ip) || [];
  const validLimits = limits.filter(t => t > windowStart);
  if (validLimits.length >= 10) return false;
  validLimits.push(now);
  rateLimit.set(ip, validLimits);
  return true;
}

function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(request) {
  if (!process.env.AIRTABLE_PAT || !process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json({ error: 'Backend Configuration Missing', code: 'CONFIG_ERROR' }, { status: 503 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const secret = searchParams.get('secret');

    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token === 'google_authenticated') {
      if (id) {
        // Fallback to record ID if needed
        let filterStr = `{orderId} = '${id}'`;
        if (id.startsWith('rec')) filterStr = `RECORD_ID() = '${id}'`;

        const records = await getRecords(process.env.AIRTABLE_ORDERS_TABLE, { filterByFormula: filterStr });
        if (records.length > 0) {
          return NextResponse.json({ _recordId: records[0].id, ...records[0].fields });
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const records = await getRecords(process.env.AIRTABLE_ORDERS_TABLE);
      return NextResponse.json(records.map(r => ({ _recordId: r.id, ...r.fields })));
    }

    if (id) {
      let filterStr = `{orderId} = '${id}'`;
      if (id.startsWith('rec')) {
        filterStr = `RECORD_ID() = '${id}'`;
      }

      const records = await getRecords(process.env.AIRTABLE_ORDERS_TABLE, { filterByFormula: filterStr });
      if (records.length > 0) {
        return NextResponse.json({ _recordId: records[0].id, ...records[0].fields, status: records[0].fields.status || records[0].fields.Status });
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    await logErrorToTelegram(error, 'GET /api/orders');
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!process.env.AIRTABLE_PAT || !process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json({ error: 'Backend Configuration Missing', code: 'CONFIG_ERROR' }, { status: 503 });
  }
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    if (!body.id || !body.productId || !body.telegramId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const methodMap = {
      'paypal': 'PayPal',
      'vodafone': 'Vodafone Cash',
      'vodafone cash': 'Vodafone Cash',
    };
    const resolvedMethod = methodMap[(body.paymentMethod || '').toLowerCase()] || 'PayPal';

    const newOrderFields = {
      userName: sanitize(body.name),
      telegram_id: sanitize(body.telegramId?.toString()),
      contact: sanitize(body.contact),
      product: sanitize(body.productName),
      price: Number(body.priceUSD) || 0,
      paymentMethod: resolvedMethod,
      image: body.productImage,
      status: body.status || 'Pending',
      confirmedDate: body.confirmedDate || null,
      orderDate: new Date().toISOString(),
    };

    // Safely try to include orderId if possible, but don't let it crash the request
    if (body.id) {
      newOrderFields.orderId = body.id;
    }

    const { createRecord } = await import('@/lib/airtable');

    // As requested: removed getTableFields and use static mapping directly from the first slot
    const finalFields = {
      userName: newOrderFields.userName,
      telegramId: newOrderFields.telegram_id,
      contact: newOrderFields.contact,
      product: newOrderFields.product,
      price: newOrderFields.price,
      paymentMethod: newOrderFields.paymentMethod,
      status: newOrderFields.status,
      confirmedDate: newOrderFields.confirmedDate,
      orderDate: newOrderFields.orderDate,
    };

    if (newOrderFields.orderId) {
      finalFields.orderId = newOrderFields.orderId;
    }

    if (finalFields.telegramId) {
      finalFields.telegramId = String(finalFields.telegramId); // Telegram IDs are safer as strings to prevent Airtable type mismatches
    }

    let created;
    try {
      created = await createRecord(process.env.AIRTABLE_ORDERS_TABLE, finalFields);
    } catch (e) {
      console.error('Airtable creation failed with mapped fields, trying stripped version:', e.message);
      const strippedFields = { ...finalFields };
      delete strippedFields.orderId;

      created = await createRecord(process.env.AIRTABLE_ORDERS_TABLE, strippedFields);
    }

    return NextResponse.json({ ...newOrderFields, id: created.id, _recordId: created.id });
  } catch (error) {
    await logErrorToTelegram(error, 'POST /api/orders');
    console.error('Airtable Error Detail:', error);
    return NextResponse.json({
      error: 'Airtable Creation Failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { recordId, secret, ...updateFields } = await request.json();

    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (token !== 'google_authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!recordId) {
      return NextResponse.json({ error: 'Missing recordId' }, { status: 400 });
    }

    const { updateRecord } = await import('@/lib/airtable');

    const finalUpdateFields = {};
    if (updateFields.status !== undefined) finalUpdateFields.status = updateFields.status;
    if (updateFields.confirmedDate !== undefined) finalUpdateFields.confirmedDate = updateFields.confirmedDate;

    let updated;
    try {
      updated = await updateRecord(process.env.AIRTABLE_ORDERS_TABLE, recordId, finalUpdateFields);
    } catch (e) {
      console.error('Update failed, retrying with direct status:', e.message);
      if (updateFields.status) {
        try {
          updated = await updateRecord(process.env.AIRTABLE_ORDERS_TABLE, recordId, { Status: updateFields.status });
        } catch (e2) {
          throw e;
        }
      } else {
        throw e;
      }
    }

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    await logErrorToTelegram(error, 'PATCH /api/orders');
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
