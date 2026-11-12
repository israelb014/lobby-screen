import { CONFIG } from './config.js';

export const params = new URLSearchParams(location.search);
const TZ = CONFIG.TIMEZONE;

const partsFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23', weekday: 'short',
});

/** Calendar/time parts of a Date in the building's time zone. */
export function tzParts(d) {
  const o = {};
  for (const p of partsFmt.formatToParts(d)) o[p.type] = p.value;
  return {
    y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second,
    dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(o.weekday),
  };
}

/** Wall-clock time in the building's time zone -> Date. */
export function zonedToDate(y, m, d, h = 0, mi = 0) {
  let guess = Date.UTC(y, m - 1, d, h, mi);
  for (let i = 0; i < 2; i++) {
    const p = tzParts(new Date(guess));
    const asUtc = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
    guess += Date.UTC(y, m - 1, d, h, mi) - asUtc;
  }
  return new Date(guess);
}

// ?now=2026-11-13T17:00 — simulated clock that keeps running from that moment
let offset = 0;
const nowParam = params.get('now');
if (nowParam) {
  const m = nowParam.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (m) offset = zonedToDate(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0)).getTime() - Date.now();
}
export const now = () => new Date(Date.now() + offset);

const pad = (n) => String(n).padStart(2, '0');
export function hhmm(d) {
  if (!(d instanceof Date) || isNaN(d)) return '—';
  const p = tzParts(d);
  return `${pad(p.h)}:${pad(p.mi)}`;
}
export function ddmmyyyy(d) {
  const p = tzParts(d);
  return `${pad(p.d)}/${pad(p.m)}/${p.y}`;
}
/** Local-midnight Date for the building's calendar day (what Hebcal expects). */
export function localDay(d) {
  const p = tzParts(d);
  return new Date(p.y, p.m - 1, p.d);
}
export function dayKey(d) {
  const p = tzParts(d);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}
export function minutesOfDay(d) {
  const p = tzParts(d);
  return p.h * 60 + p.mi;
}
export function parseHM(s) {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + (m || 0);
}

/** Wrap a function so an exception is logged and never propagates. */
export function guard(name, fn) {
  return (...args) => {
    try {
      const r = fn(...args);
      if (r && typeof r.catch === 'function') return r.catch((e) => console.error(`[${name}]`, e));
      return r;
    } catch (e) {
      console.error(`[${name}]`, e);
    }
  };
}

export const store = {
  get(key) {
    try { const v = localStorage.getItem('lobby.' + key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem('lobby.' + key, JSON.stringify(val)); } catch { /* ignore */ }
  },
};

export async function fetchWithTimeout(url, ms = 15000, opts = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
    return r;
  } finally {
    clearTimeout(t);
  }
}

export const bust = (url) => url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function photoUrl(name) {
  name = String(name || '').trim();
  if (!name) return '';
  return /^https?:\/\//i.test(name) ? name : 'assets/photos/' + name;
}

/** Image that never shows a broken-image icon: on error it hides itself. */
export function safeImg(src, cls = '') {
  const img = new Image();
  img.className = cls;
  img.alt = '';
  img.decoding = 'async';
  img.addEventListener('error', () => img.classList.add('broken'));
  if (src) img.src = src; else img.classList.add('broken');
  return img;
}
