import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRecords, createRecord, getTableFields } from '@/lib/airtable';
import { logErrorToTelegram } from '@/lib/error-logger';

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
      userEmail: sanitize(body.telegramId?.toString()),
      product: sanitize(body.productName),
      price: Number(body.priceUSD) || 0,
      paymentMethod: resolvedMethod,
      image: body.productImage, // Store product image URL
      status: body.status || 'Pending',
      confirmedDate: body.confirmedDate || null,
      orderDate: new Date().toISOString(),
    };

    // Safely try to include orderId if possible, but don't let it crash the request
    if (body.id) {
       newOrderFields.orderId = body.id;
    }

    const { createRecord, getTableFields } = await import('@/lib/airtable');
    
    // ROOT CAUSE FIX: Fetch actual field names from Airtable to avoid mismatch errors
    const availableFields = await getTableFields(process.env.AIRTABLE_ORDERS_TABLE);
    
    // Create the final payload by only including fields that actually exist in the base
    const finalFields = {};
    
    // Define a map of our local names to possible Airtable names (casing variations)
    const fieldMapping = {
      userName: ['userName', 'Username', 'name', 'Name'],
      userEmail: ['userEmail', 'Email', 'Customer Email', 'telegramId'],
      product: ['product', 'Product', 'productName', 'Product Name'],
      price: ['price', 'Price', 'Amount', 'Total'],
      paymentMethod: ['paymentMethod', 'Method', 'Payment Method'],
      status: ['status', 'Status', 'Order Status'],
      confirmedDate: ['confirmedDate', 'Confirmed Date', 'Approved At'],
      orderDate: ['orderDate', 'Date', 'Ordered At'],
      orderId: ['orderid', 'orderId', 'OrderId', 'ID']
    };

    // Populate finalFields based on available columns
    for (const [key, alternatives] of Object.entries(fieldMapping)) {
      const match = alternatives.find(alt => availableFields.includes(alt)) || availableFields.find(f => f.toLowerCase() === alternatives[0].toLowerCase());
      if (match && newOrderFields[key] !== undefined) {
        finalFields[match] = newOrderFields[key];
      }
    }

    // Special case for orderId (if it's a Number field in Airtable, it might fail with string ID)
    // Looking at the image, orderid 33, 34 suggests it's a number.
    // We will only send it if it doesn't look like an Autonumber (i.e. if it's empty in record creation)
    // But generally, safer to let Airtable manage its IDs if we are not sure.

    let created;
    try {
      created = await createRecord(process.env.AIRTABLE_ORDERS_TABLE, finalFields);
    } catch (e) {
      console.error('Airtable creation failed with mapped fields, trying stripped version:', e.message);
      // Last ditch effort: try without orderid in case it's a formula/auto field
      const strippedFields = { ...finalFields };
      const idKey = Object.keys(strippedFields).find(k => k.toLowerCase().includes('id'));
      if (idKey) delete strippedFields[idKey];
      
      created = await createRecord(process.env.AIRTABLE_ORDERS_TABLE, strippedFields);
    }
    
    return NextResponse.json({ ...newOrderFields, id: created.id, _recordId: created.id });
  } catch (error) {
    await logErrorToTelegram(error, 'POST /api/orders');
    return NextResponse.json({ error: 'Failed to create order', details: error.message }, { status: 500 });
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

    const { updateRecord, getTableFields } = await import('@/lib/airtable');
    
    // Field mapping for PATCH (similar to POST)
    const availableFields = await getTableFields(process.env.AIRTABLE_ORDERS_TABLE);
    const finalUpdateFields = {};
    const fieldMapping = {
      status: ['status'],
      confirmedDate: ['confirmedDate']
    };

    for (const [key, alternatives] of Object.entries(fieldMapping)) {
      const match = alternatives.find(alt => availableFields.includes(alt)) || availableFields.find(f => f.toLowerCase() === alternatives[0].toLowerCase());
      if (match && updateFields[key] !== undefined) {
        finalUpdateFields[match] = updateFields[key];
      }
    }

    // If no mapping found for status, fallback to a best guess if it's provided
    if (updateFields.status && !finalUpdateFields.status && !finalUpdateFields.Status) {
        finalUpdateFields['status'] = updateFields.status; 
    }

    let updated;
    try {
      updated = await updateRecord(process.env.AIRTABLE_ORDERS_TABLE, recordId, finalUpdateFields);
    } catch (e) {
      console.error('Update failed, retrying with direct status:', e.message);
      // Fallback for strict schemas
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
