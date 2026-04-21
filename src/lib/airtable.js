export const getBaseUrl = (tableId) => `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableId)}`;
export const getMetaUrl = () => `https://api.airtable.com/v0/meta/bases/${process.env.AIRTABLE_BASE_ID}/tables`;
import { logErrorToTelegram } from './error-logger';

const getHeaders = () => {
  if (!process.env.AIRTABLE_PAT) {
    throw new Error('AIRTABLE_PAT is not defined');
  }
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
    'Content-Type': 'application/json',
  };
};

export async function getTableFields(tableId) {
  try {
    const res = await fetch(getMetaUrl(), {
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Airtable metadata: ${res.statusText}`);
    }
    const data = await res.json();
    const table = data.tables?.find(t => t.id === tableId || t.name === tableId);
    if (!table) throw new Error('Table not found in metadata');
    return table.fields.map(f => f.name);
  } catch (error) {
    console.warn('getTableFields meta error, falling back to record fetch:', error.message);
    try {
      // Fallback: Fetch 1 record to see available fields
      const res = await fetch(`${getBaseUrl(tableId)}?maxRecords=1`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.records?.[0]) {
          return Object.keys(data.records[0].fields);
        }
      }
    } catch (fallbackError) {
      console.error('getTableFields fallback error:', fallbackError);
    }
    return [];
  }
}

export async function getRecords(tableId, options = {}) {
  try {
    let url = getBaseUrl(tableId);
    const params = new URLSearchParams();
    if (options.filterByFormula) {
      params.append('filterByFormula', options.filterByFormula);
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        params.append(`sort[${i}][field]`, s.field);
        if (s.direction) params.append(`sort[${i}][direction]`, s.direction);
      });
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const res = await fetch(url, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch records: ${res.statusText}`);
    }
    const data = await res.json();
    return data.records;
  } catch (error) {
    console.error('getRecords error:', error);
    return [];
  }
}

export async function createRecord(tableId, fields) {
  try {
    const res = await fetch(getBaseUrl(tableId), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ records: [{ fields }], typecast: true })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create record: ${res.statusText} ${err}`);
    }
    const data = await res.json();
    return data.records[0];
  } catch (error) {
    console.error('createRecord error:', error);
    throw error;
  }
}

export async function updateRecord(tableId, recordId, fields) {
  try {
    const res = await fetch(`${getBaseUrl(tableId)}/${recordId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ fields, typecast: true })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to update record: ${res.statusText} ${err}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('updateRecord error:', error);
    throw error;
  }
}

export async function deleteRecord(tableId, recordId) {
  try {
    const res = await fetch(`${getBaseUrl(tableId)}/${recordId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error(`Failed to delete record: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('deleteRecord error:', error);
    throw error;
  }
}
