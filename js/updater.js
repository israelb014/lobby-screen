// Self-update and self-healing: version.json polling, nightly reload, error-storm reload.
import { CONFIG } from './config.js';
import { fetchWithTimeout, bust, guard, minutesOfDay, parseHM, dayKey } from './util.js';
import { isShabbat } from './theme.js';

let loadedVersion = null;
let loadedConfig = null;
const errors = [];

async function hardReload() {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.update();
  } catch (e) { console.warn('[updater] sw update failed', e); }
  location.reload();
}

async function checkVersion() {
  if (isShabbat()) return;
  const r = await fetchWithTimeout(bust('version.json'), 15000, { cache: 'no-store' });
  const v = (await r.json()).version;
  if (!v) return;
  if (loadedVersion === null) loadedVersion = v;
  else if (v !== loadedVersion) {
    console.info('[updater] new version', v, '— reloading');
    await hardReload();
    return;
  }
  // a change to js/config.js (e.g. edited on github.com) also reloads the screen
  const c = await (await fetchWithTimeout(bust('js/config.js'), 15000, { cache: 'no-store' })).text();
  if (loadedConfig === null) loadedConfig = c;
  else if (c !== loadedConfig) {
    console.info('[updater] config.js changed — reloading');
    await hardReload();
  }
}

function nightly() {
  if (isShabbat()) return;
  const real = new Date();
  if (minutesOfDay(real) !== parseHM(CONFIG.NIGHTLY_RELOAD)) return;
  const k = dayKey(real);
  try {
    if (localStorage.getItem('lobby.nightly') === k) return;
    localStorage.setItem('lobby.nightly', k);
  } catch { /* ignore */ }
  hardReload();
}

function recordError(kind, detail) {
  console.error(`[${kind}]`, detail);
  const t = Date.now();
  errors.push(t);
  while (errors.length && t - errors[0] > 3600000) errors.shift();
  if (errors.length > 20 && !isShabbat()) {
    errors.length = 0;
    console.warn('[updater] too many errors in the last hour — reloading');
    setTimeout(hardReload, 1000);
  }
}

export function initErrorHandling() {
  window.addEventListener('error', (e) => {
    if (e.target && e.target !== window && e.target.tagName === 'IMG') return; // handled by safeImg
    recordError('error', e.error || e.message);
  }, true);
  window.addEventListener('unhandledrejection', (e) => recordError('unhandledrejection', e.reason));
}

export function initUpdater() {
  guard('updater', checkVersion)();
  setInterval(guard('updater', checkVersion), CONFIG.VERSION_CHECK_MS);
  setInterval(guard('updater', nightly), 20000);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((e) => console.warn('[sw] register failed', e));
  }
}
