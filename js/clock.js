// Clock, Gregorian and Hebrew date. Drives the once-a-minute tick for the whole page.
import { HDate } from './vendor/hebcal-core.js';
import { now, hhmm, ddmmyyyy, localDay, dayKey, guard } from './util.js';

const tickListeners = [];
const dayListeners = [];
let lastDay = '';

export const onTick = (fn) => tickListeners.push(fn);
export const onNewDay = (fn) => dayListeners.push(fn);

export function hebrewDate(d) {
  // "ב׳ כסלו תשפ״ז" -> "ב׳ בכסלו תשפ״ז"
  const s = new HDate(localDay(d)).renderGematriya(true);
  const t = s.split(' ');
  if (t.length < 3) return s;
  return `${t[0]} ב${t.slice(1, -1).join(' ')} ${t[t.length - 1]}`;
}

function render() {
  const n = now();
  const k = dayKey(n);
  document.getElementById('clock').textContent = hhmm(n);
  if (k !== lastDay) {
    const first = !lastDay;
    lastDay = k;
    document.getElementById('gdate').textContent = ddmmyyyy(n);
    guard('hdate', () => { document.getElementById('hdate').textContent = hebrewDate(n); })();
    if (!first) for (const fn of dayListeners) guard('new-day', fn)();
  }
  for (const fn of tickListeners) guard('tick', fn)();
}

function schedule() {
  const ms = 60000 - (now().getTime() % 60000) + 50;
  setTimeout(() => {
    guard('clock', render)();
    schedule();
  }, ms);
}

export function initClock() {
  guard('clock', render)();
  schedule();
  // safety net in case timers are throttled: re-sync every 30s
  setInterval(guard('clock', () => {
    if (document.getElementById('clock').textContent !== hhmm(now())) render();
  }), 30000);
}
