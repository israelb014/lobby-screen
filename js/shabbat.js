// Shabbat / Yom Tov periods (candle lighting -> havdalah) from Hebcal.
import { HebrewCalendar, Location, flags } from './vendor/hebcal-core.js';
import { CONFIG } from './config.js';
import { localDay, dayKey, hhmm } from './util.js';

export const location = new Location(
  CONFIG.LATITUDE, CONFIG.LONGITUDE, true, CONFIG.TIMEZONE, 'Ramla', 'IL', undefined, CONFIG.ELEVATION,
);

const NO_NIKUD = (s) => String(s || '').replace(/[֑-ֽֿ-ׇ]/g, '');
const LOCALE = 'he-x-NoNikud';

function holidayTitle(ev) {
  return NO_NIKUD(ev.render(LOCALE))
    .replace(/\s+\d{4}$/, '')
    .replace(/\s+[א-ת]{1,2}׳$/, '')
    .replace(/\s+\([^)]*\)$/, '')
    .trim();
}

let cacheKey = '';
let cached = [];

function compute(n) {
  const start = localDay(n);
  start.setDate(start.getDate() - 3);
  const end = localDay(n);
  end.setDate(end.getDate() + 20);
  const events = HebrewCalendar.calendar({
    start, end, location, il: true, sedrot: true, candlelighting: true,
    candleLightingMins: CONFIG.CANDLE_LIGHTING_MINUTES, havdalahDeg: CONFIG.HAVDALAH_DEGREES,
    useElevation: true, noMinorFast: true, noModern: true, noRoshChodesh: true,
    noSpecialShabbat: true, shabbatMevarchim: false,
  });
  const marks = events
    .filter((e) => e.eventTime && (e.getDesc() === 'Candle lighting' || e.getDesc() === 'Havdalah'))
    .sort((a, b) => a.eventTime - b.eventTime);

  const periods = [];
  let open = null;
  for (const e of marks) {
    if (e.getDesc() === 'Candle lighting') {
      if (!open) open = e;
    } else if (open) {
      periods.push({ start: open.eventTime, end: e.eventTime });
      open = null;
    }
  }

  for (const p of periods) {
    const s0 = dayKey(p.start);
    const e0 = dayKey(p.end);
    const inside = events.filter((e) => {
      const k = e.getDate().greg();
      const key = `${k.getFullYear()}-${String(k.getMonth() + 1).padStart(2, '0')}-${String(k.getDate()).padStart(2, '0')}`;
      return key > s0 && key <= e0; // the days that the period covers (day after candle lighting .. end)
    });
    const chag = inside.find((e) => e.getFlags() & flags.CHAG);
    const parsha = inside.find((e) => e.getFlags() & flags.PARSHA_HASHAVUA);
    p.isHoliday = !!chag;
    if (chag) {
      p.title = holidayTitle(chag);
      p.startLabel = 'כניסת החג';
      p.endLabel = 'צאת החג';
    } else {
      const other = inside.find((e) => (e.getFlags() & flags.CHOL_HAMOED) || /שבת/.test(NO_NIKUD(e.render(LOCALE))));
      p.title = parsha ? NO_NIKUD(parsha.render(LOCALE)) : other ? NO_NIKUD(other.render(LOCALE)) : 'שבת קודש';
      p.startLabel = 'כניסת שבת';
      p.endLabel = 'צאת שבת';
    }
    p.startText = hhmm(p.start);
    p.endText = hhmm(p.end);
  }
  return periods;
}

export function periods(n) {
  const k = dayKey(n);
  if (k !== cacheKey) {
    cached = compute(n);
    cacheKey = k;
  }
  return cached;
}

export const current = (n) => periods(n).find((p) => p.start <= n && n < p.end) || null;
export const upcoming = (n) => current(n) || periods(n).find((p) => p.start > n) || null;
export function invalidate() { cacheKey = ''; }
