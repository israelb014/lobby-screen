// Daily halachic times for Ramla + the Shabbat / holiday card.
import { Zmanim } from './vendor/hebcal-core.js';
import { CONFIG } from './config.js';
import { now, hhmm, localDay, esc } from './util.js';
import { location } from './shabbat.js';
import { shabbatInfo } from './theme.js';

let times = [];

function compute() {
  const z = new Zmanim(location, localDay(now()), true);
  times = [
    ['עלות השחר', z.alotHaShachar()],
    ['זריחה', z.sunrise()],
    ['סוף זמן ק״ש (גר״א)', z.sofZmanShma()],
    ['חצות', z.chatzot()],
    ['שקיעה', z.sunset()],
    ['צאת הכוכבים', z.tzeit(CONFIG.HAVDALAH_DEGREES)],
  ];
}

export function renderZmanim(recompute = false) {
  if (recompute || !times.length) compute();
  const n = now();
  let next = times.findIndex(([, t]) => t instanceof Date && !isNaN(t) && t > n);
  if (next < 0) next = 0; // after tzeit: highlight tomorrow's alot
  document.getElementById('zList').innerHTML = times
    .map(([name, t], i) => `<li class="${i === next ? 'next' : ''}"><span class="zn">${esc(name)}</span><span class="zt">${hhmm(t)}</span></li>`)
    .join('');
}

export function renderShabbatCard() {
  const p = shabbatInfo();
  const card = document.getElementById('shabbatCard');
  card.classList.toggle('is-holiday', !!(p && p.isHoliday));
  document.getElementById('shPill').textContent = p && p.isHoliday ? 'חג שמח' : 'שבת שלום';
  document.getElementById('shTitle').textContent = p ? p.title : '—';
  document.getElementById('shIn').innerHTML = p ? `${esc(p.startLabel)} <b>${esc(p.startText)}</b>` : '—';
  document.getElementById('shOut').innerHTML = p ? `${esc(p.endLabel)} <b>${esc(p.endText)}</b>` : '—';
}
