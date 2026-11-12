// News ticker: data/news.json (written hourly by a GitHub Action).
// Moves left-to-right at a constant speed; content is duplicated so the loop is seamless.
// New headlines are swapped in only at the end of a full cycle.
import { CONFIG } from './config.js';
import { fetchWithTimeout, store, guard, esc, bust } from './util.js';
import { isShabbat, onMode } from './theme.js';

let items = [];
let pending = null;
let offset = 0;
let cycleWidth = 0;
let raf = 0;
let last = 0;
let track;
let view;

const itemsHtml = (list) => list.map((t) => `<span class="titem">${esc(t)}</span><span class="tdot"></span>`).join('');

function build() {
  if (!track) return;
  if (!items.length) { track.innerHTML = ''; cycleWidth = 0; return; }
  track.innerHTML = `<div class="tgroup">${itemsHtml(items)}</div>`;
  const g = track.firstElementChild;
  // repeat the list inside one group until it is wider than the view, then duplicate the group
  let reps = 1;
  while (g.offsetWidth < view.offsetWidth && reps < 20) {
    g.insertAdjacentHTML('beforeend', itemsHtml(items));
    reps++;
  }
  cycleWidth = g.offsetWidth;
  track.appendChild(g.cloneNode(true));
  offset = 0;
  track.style.transform = 'translate3d(0,0,0)';
}

function frame(t) {
  raf = requestAnimationFrame(frame);
  if (!last) last = t;
  const dt = Math.min(0.1, (t - last) / 1000);
  last = t;
  if (!cycleWidth) return;
  offset += CONFIG.TICKER_SPEED_PX_PER_SEC * dt;
  if (offset >= cycleWidth) {
    offset -= cycleWidth;
    if (pending) {
      items = pending;
      pending = null;
      build();
    }
  }
  track.style.transform = `translate3d(${offset.toFixed(2)}px,0,0)`;
}

function start() {
  if (raf || isShabbat()) return;
  last = 0;
  raf = requestAnimationFrame(frame);
}
function stop() {
  cancelAnimationFrame(raf);
  raf = 0;
}

function accept(list) {
  if (!Array.isArray(list) || !list.length) return;
  list = list.map((s) => String(s).trim()).filter(Boolean);
  if (!list.length || JSON.stringify(list) === JSON.stringify(pending || items)) return;
  if (!items.length || !cycleWidth) {
    items = list;
    build();
  } else {
    pending = list;
  }
}

async function load() {
  if (isShabbat()) return;
  try {
    const r = await fetchWithTimeout(bust('data/news.json'), 15000, { cache: 'no-store' });
    const d = await r.json();
    if (!Array.isArray(d.items)) throw new Error('news: bad format');
    store.set('news', d.items);
    accept(d.items);
  } catch (e) {
    console.warn('[news] using saved data:', e.message);
    accept(store.get('news'));
  }
}

export function initNews() {
  track = document.getElementById('tickerTrack');
  view = document.getElementById('tickerView');
  accept(store.get('news'));
  guard('news', load)();
  setInterval(guard('news', load), CONFIG.NEWS_REFRESH_MS);
  onMode((m) => {
    if (m === 'shabbat') stop();
    else { if (!cycleWidth) build(); start(); }
  });
  start();
}
