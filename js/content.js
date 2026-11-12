// Shared loader for notices and building photos:
// Google Sheets CSV -> data/content.json -> localStorage.
import { CONFIG } from './config.js';
import { fetchWithTimeout, store, bust } from './util.js';
import { parseCSV, isActive, dropHeader } from './csv.js';

let fallbackPromise = null;
let fallbackAt = 0;

async function contentJson() {
  if (!fallbackPromise || Date.now() - fallbackAt > 60000) {
    fallbackAt = Date.now();
    fallbackPromise = fetchWithTimeout(bust('data/content.json'), 15000, { cache: 'no-store' }).then((r) => r.json());
    fallbackPromise.catch(() => { fallbackPromise = null; });
  }
  return fallbackPromise;
}

async function fromSheet(url, mapRow) {
  const r = await fetchWithTimeout(url, 20000, { cache: 'no-store' });
  const text = await r.text();
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('sheet returned HTML, not CSV');
  return dropHeader(parseCSV(text)).filter((row) => isActive(row[0])).map(mapRow).filter(Boolean);
}

export async function loadNotices() {
  const mapRow = (r) => {
    const n = { category: (r[1] || '').trim(), title: (r[2] || '').trim(), body: (r[3] || '').trim() };
    return n.title || n.body ? n : null;
  };
  let list = null;
  if (CONFIG.NOTICES_CSV_URL) {
    try { list = await fromSheet(CONFIG.NOTICES_CSV_URL, mapRow); } catch (e) { console.warn('[notices] sheet failed:', e.message); }
  }
  if (!list) {
    try {
      const d = await contentJson();
      list = (d.notices || []).filter((n) => n.active !== false && (n.title || n.body));
    } catch (e) { console.warn('[notices] content.json failed:', e.message); }
  }
  if (list) store.set('notices', list);
  else list = store.get('notices') || [];
  return list;
}

export async function loadPhotos() {
  const mapRow = (r) => (r[1] || '').trim() || null;
  let list = null;
  if (CONFIG.PHOTOS_CSV_URL) {
    try { list = await fromSheet(CONFIG.PHOTOS_CSV_URL, mapRow); } catch (e) { console.warn('[photos] sheet failed:', e.message); }
  }
  if (!list || !list.length) {
    try {
      const d = await contentJson();
      const l = (d.photos || []).map((p) => (typeof p === 'string' ? p : p && p.active !== false ? p.file : null)).filter(Boolean);
      if (l.length) list = l;
    } catch (e) { console.warn('[photos] content.json failed:', e.message); }
  }
  if (list && list.length) store.set('photos', list);
  else list = store.get('photos') || CONFIG.DEFAULT_BUILDING_PHOTOS;
  return list;
}
