// Display mode: day / night / shabbat.
import { CONFIG } from './config.js';
import { now, minutesOfDay, parseHM, guard, params } from './util.js';
import * as shabbat from './shabbat.js';

let mode = null;
let forced = null;
const listeners = [];

export const getMode = () => mode;
export const isShabbat = () => mode === 'shabbat';
export const onMode = (fn) => listeners.push(fn);

/** Info for the Shabbat/holiday currently in effect (or the next one). */
export function shabbatInfo() {
  try { return shabbat.upcoming(now()); } catch (e) { console.error('[theme]', e); return null; }
}

function isNight(n) {
  const m = minutesOfDay(n);
  const a = parseHM(CONFIG.NIGHT_START);
  const b = parseHM(CONFIG.NIGHT_END);
  return a <= b ? m >= a && m < b : m >= a || m < b;
}

export function evaluate() {
  const n = now();
  let m = forced;
  if (!m) {
    let inShabbat = false;
    try { inShabbat = !!shabbat.current(n); } catch (e) { console.error('[theme]', e); }
    m = inShabbat ? 'shabbat' : isNight(n) ? 'night' : 'day';
  }
  const info = m === 'shabbat' ? shabbatInfo() : null;
  const holiday = !!(info && info.isHoliday);
  const changed = m !== mode || holiday !== document.body.classList.contains('holiday');
  if (!changed) return;
  mode = m;
  document.body.classList.remove('mode-day', 'mode-night', 'mode-shabbat');
  document.body.classList.add('mode-' + m);
  document.body.classList.toggle('holiday', holiday);
  for (const fn of listeners) guard('mode-listener', fn)(m);
}

export function force(m) {
  forced = m;
  evaluate();
}

export function initPreview() {
  if (params.get('preview') !== '1') return;
  const box = document.getElementById('preview');
  const btns = [['day', 'יום'], ['night', 'לילה'], ['shabbat', 'שבת']];
  for (const [m, label] of btns) {
    const b = document.createElement('button');
    b.textContent = label;
    b.dataset.mode = m;
    b.addEventListener('click', () => {
      const off = forced === m;
      force(off ? null : m);
      box.querySelectorAll('button').forEach((x) => x.classList.toggle('on', !off && x === b));
    });
    box.appendChild(b);
  }
  box.hidden = false;
  document.body.classList.add('previewing');
}
