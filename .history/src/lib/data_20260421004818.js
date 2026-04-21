import { getRecords } from './airtable';

// Default image
export const DEFAULT_IMAGE = '/default.png';

// Memory cache for server-side performance
let globalCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 seconds

// Normalizer to map Airtable record to the old format
function mapAirtableRecord(record, defaultType) {
  const f = record.fields;
  
  let imageList = [];
  
  const primaryImgs = f.imgs || f.image || f.img || f.image1;
  if (primaryImgs) {
    if (Array.isArray(primaryImgs)) {
      imageList.push(...primaryImgs.map(att => att.url).filter(Boolean));
    } else if (typeof primaryImgs === 'string') {
      imageList.push(primaryImgs);
    }
  }
  
  const rawImages = [
    f.image2,
    f.image3,
    f.image4,
    f.thumbnail
  ].filter(Boolean);

  const additionalImages = rawImages.map(img => {
    let url = typeof img === 'string' ? img.trim() : (img[0]?.url || '');
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/file\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
      if (fileIdMatch && fileIdMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
      }
    }
    return url;
  }).filter(url => {
    const s = url.toLowerCase();
    return s.startsWith('http') || s.startsWith('/') || s.includes('.png') || s.includes('.jpg') || s.includes('.webp') || s.includes('.gif');
  });

  imageList = [...imageList, ...additionalImages];

  const isProductFlag = f.isProduct === true || String(f.isProduct).toLowerCase() === 'true';
  const resolvedType = isProductFlag ? 'Product' : 'Design';
  const rawPrice = f.price || f.Price;
  const parsedPrice = rawPrice ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, '')) : 0;
  const resolvedPrice = isProductFlag ? parsedPrice : 0;

  return {
    _recordId: record.id,
    id: parseInt(f.id) || record.id,
    title: f.title || f.Title || f.name || f.Name || 'Untitled',
    category: f.category || f.Category || 'Mobile',
    type: resolvedType,
    price: resolvedPrice,
    image: imageList[0] || DEFAULT_IMAGE,
    images: imageList.length > 0 ? imageList : [DEFAULT_IMAGE],
    description: f.description || f.Description || 'No description provided.',
    fileLink: f.filelink || f.file_link || f.link || f.fileLink || f.FileLink || '#'
  };
}

export async function fetchDesigns() {
  if (!process.env.AIRTABLE_DESIGNS_TABLE) {
    return fallbackDesigns;
  }
  try {
    const records = await getRecords(process.env.AIRTABLE_DESIGNS_TABLE, {
      filterByFormula: "OR({type}='Design', {Type}='Design', NOT({type}='Product'))"
    });
    return records.map(r => mapAirtableRecord(r, 'Design'));
  } catch (err) {
    console.warn('Airtable Fetch Designs Error:', err.message);
    return fallbackDesigns;
  }
}

export async function fetchProducts() {
  const now = Date.now();
  if (globalCache.data && (now - globalCache.timestamp < CACHE_TTL)) {
    return globalCache.data;
  }

  if (!process.env.AIRTABLE_DESIGNS_TABLE) {
    return [...fallbackDesigns, ...fallbackProducts];
  }

  try {
    const records = await getRecords(process.env.AIRTABLE_DESIGNS_TABLE);
    const allItems = records.map(r => mapAirtableRecord(r, 'Product'));

    if (allItems.length > 0) {
      globalCache = { data: allItems, timestamp: now };
      return allItems;
    }
    
    return [...fallbackDesigns, ...fallbackProducts];
  } catch (err) {
    console.warn('Airtable Fetch Products Error:', err.message);
    return [...fallbackDesigns, ...fallbackProducts];
  }
}

// ─── Fallback Mock Data ────────────────────────────────────

export const fallbackProducts = [
  {
    id: 1,
    title: "Modern Food Delivery App UI/UX Design",
    category: "Mobile",
    type: "Product",
    price: 5,
    image: ['/products/P1.0.png'],
    images: ['/P1.0.png','/P1.1.png','/P1.2.png','/P1.3.png',],
    fileLink: "https://drive.google.com/drive/folders/1seykNaoyrelcJ-zDTbABJVcuUO1ncNHd?usp=drive_link",
    description: "Premium admin dashboard with analytics & charts.",
  },
  // {
  //   id: 2,
  //   title: "Dashboard Pro",
  //   category: "Mobile",
  //   type: "Product",
  //   price: 5,
  //   image: ['/P2.0.png','/P2.1.png','/P2.2.png','/P2.3.png',],
  //   fileLink: "https://drive.google.com/drive/folders/1uXzhaatZPLe3kUzPfJZQqQRfuilx0OvI?usp=drive_link",
  //   description: "Premium admin dashboard with analytics & charts.",
  // },
];

export const fallbackDesigns = [
  
];

// Combined data for pages that need both
export const allItems = [...fallbackDesigns, ...fallbackProducts];

export const features = [
  {
    id: 1,
    title: "Modern UI",
    description: "Clean designs inspired by the latest trends.",
    icon: "Layout",
  },
  {
    id: 2,
    title: "Responsive",
    description: "Optimized for mobile, tablet, and desktop.",
    icon: "Smartphone",
  },
  {
    id: 3,
    title: "Ready to Use",
    description: "Assets and components ready for development.",
    icon: "Package",
  },
];

