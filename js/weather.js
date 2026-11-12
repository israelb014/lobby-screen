// Weather from Open-Meteo (no API key). Falls back to the last saved forecast.
import { CONFIG } from './config.js';
import { fetchWithTimeout, store, guard, esc, tzParts } from './util.js';
import { icon, wmo } from './icons.js';
import { isShabbat } from './theme.js';

const DAY_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];

const url = () => 'https://api.open-meteo.com/v1/forecast'
  + `?latitude=${CONFIG.LATITUDE}&longitude=${CONFIG.LONGITUDE}`
  + '&current=temperature_2m,weather_code,is_day'
  + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
  + `&timezone=${encodeURIComponent(CONFIG.TIMEZONE)}&forecast_days=4`;

const deg = (v) => (v === null || v === undefined || isNaN(v) ? '—' : `${Math.round(v)}°`);

function render(d) {
  if (!d || !d.current) return;
  const cur = wmo(d.current.weather_code, d.current.is_day !== 0);
  document.getElementById('wIcon').innerHTML = icon(cur.icon, 'wx');
  document.getElementById('wTemp').textContent = deg(d.current.temperature_2m);
  document.getElementById('wDesc').textContent = cur.text;
  const daily = d.daily || {};
  const tiles = [];
  for (let i = 1; i <= 3; i++) {
    const date = daily.time && daily.time[i];
    let name = '—';
    if (date) {
      const [y, m, dd] = date.split('-').map(Number);
      name = DAY_NAMES[tzParts(new Date(Date.UTC(y, m - 1, dd, 12))).dow] || '—';
    }
    const w = wmo(daily.weather_code ? daily.weather_code[i] : null, true);
    const hi = deg(daily.temperature_2m_max && daily.temperature_2m_max[i]);
    const lo = deg(daily.temperature_2m_min && daily.temperature_2m_min[i]);
    tiles.push(`<div class="wday"><div class="wdn">${esc(name)}</div>${icon(w.icon, 'wx')}<div class="wdt" dir="ltr">${hi}/${lo}</div></div>`);
  }
  document.getElementById('wDays').innerHTML = tiles.join('');
}

async function load() {
  if (isShabbat()) return;
  try {
    const r = await fetchWithTimeout(url(), 20000);
    const d = await r.json();
    if (!d.current) throw new Error('weather: bad response');
    store.set('weather', d);
    render(d);
  } catch (e) {
    console.warn('[weather] using saved data:', e.message);
    render(store.get('weather'));
  }
}

export function initWeather() {
  guard('weather', render)(store.get('weather'));
  guard('weather', load)();
  setInterval(guard('weather', load), CONFIG.WEATHER_REFRESH_MS);
}
