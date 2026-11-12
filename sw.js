// Service worker: keeps the lobby screen running when the internet is down.
// - Site files (HTML/CSS/JS): network-first (so updates arrive), cache fallback.
// - JSON / CSV data (local and remote): network-first, cache fallback (query string ignored).
// - Fonts and images: cache-first, refreshed in the background.
const CACHE = 'lobby-v1';
const PRECACHE = [
  './', 'index.html', 'css/style.css', 'version.json', 'data/content.json', 'data/news.json',
  'js/main.js', 'js/config.js', 'js/util.js', 'js/icons.js', 'js/csv.js', 'js/content.js',
  'js/clock.js', 'js/notices.js', 'js/photos.js', 'js/weather.js', 'js/zmanim.js',
  'js/shabbat.js', 'js/news.js', 'js/theme.js', 'js/updater.js', 'js/vendor/hebcal-core.js',
  'fonts/heebo-hebrew-400-normal.woff2', 'fonts/heebo-hebrew-500-normal.woff2',
  'fonts/heebo-hebrew-700-normal.woff2', 'fonts/heebo-hebrew-800-normal.woff2',
  'fonts/heebo-latin-400-normal.woff2', 'fonts/heebo-latin-500-normal.woff2',
  'fonts/heebo-latin-700-normal.woff2', 'fonts/heebo-latin-800-normal.woff2',
  'assets/photos/building-1.jpg', 'assets/photos/building-2.jpg', 'assets/photos/building-3.jpg',
  'assets/photos/beach.jpg', 'assets/photos/candles.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // add one by one so a single missing file does not break the install
    await Promise.all(PRECACHE.map((u) => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

function cacheKey(req) {
  const url = new URL(req.url);
  if (/\.(json|csv)$/i.test(url.pathname) || url.searchParams.has('t')) {
    url.searchParams.delete('t');
  }
  if (req.mode === 'navigate' && url.origin === self.location.origin) {
    return new URL('./', self.registration.scope).href; // one cached copy of the page
  }
  return url.href;
}

async function put(req, res) {
  if (!res || (!res.ok && res.type !== 'opaque')) return;
  try {
    const cache = await caches.open(CACHE);
    await cache.put(cacheKey(req), res);
  } catch (e) { /* quota etc. */ }
}

async function networkFirst(req, timeoutMs) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const sameOrigin = new URL(req.url).origin === self.location.origin;
    const res = await fetch(req, sameOrigin ? { cache: 'no-cache', signal: ctl.signal } : { signal: ctl.signal });
    clearTimeout(t);
    if (res.ok || res.type === 'opaque') put(req, res.clone());
    else throw new Error('HTTP ' + res.status);
    return res;
  } catch (e) {
    clearTimeout(t);
    const hit = await caches.match(cacheKey(req), { ignoreVary: true });
    if (hit) return hit;
    throw e;
  }
}

async function cacheFirst(req, event) {
  const hit = await caches.match(cacheKey(req), { ignoreVary: true });
  const refresh = fetch(req, { cache: 'no-cache' }).then((res) => { put(req, res.clone()); return res; });
  if (hit) {
    event.waitUntil(refresh.catch(() => {}));
    return hit;
  }
  return refresh;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isMedia = req.destination === 'image' || req.destination === 'font' || /\.(jpe?g|png|webp|gif|svg|woff2?)$/i.test(url.pathname);
  if (isMedia) {
    event.respondWith(cacheFirst(req, event));
  } else {
    event.respondWith(networkFirst(req, url.origin === self.location.origin ? 8000 : 20000));
  }
});
