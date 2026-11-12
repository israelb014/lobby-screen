import { CONFIG } from './config.js';
import { guard, esc } from './util.js';
import { icon } from './icons.js';
import { initErrorHandling, initUpdater } from './updater.js';
import { initClock, onTick, onNewDay } from './clock.js';
import * as theme from './theme.js';
import * as shabbat from './shabbat.js';
import { renderZmanim, renderShabbatCard } from './zmanim.js';
import { initWeather } from './weather.js';
import { initNews } from './news.js';
import { initNotices } from './notices.js';
import { initPhotos } from './photos.js';

initErrorHandling();

// --- fixed 1920x1080 canvas, scaled to fit any window (letterboxed) ---
function fitStage() {
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  document.getElementById('stage').style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', guard('fit', fitStage));
guard('fit', fitStage)();

// --- static texts and icons from config ---
guard('static', () => {
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
  document.getElementById('welcome').textContent = CONFIG.WELCOME_TEXT;
  document.getElementById('address').textContent = CONFIG.BUILDING_ADDRESS;
  document.getElementById('wLoc').textContent = CONFIG.LOCATION_NAME;
  const logo = document.getElementById('logo');
  if (CONFIG.LOGO_IMAGE) {
    const img = new Image();
    img.alt = '';
    img.onerror = () => { logo.innerHTML = `<span>${esc(CONFIG.LOGO_TEXT)}</span>`; };
    img.src = 'assets/' + CONFIG.LOGO_IMAGE;
    logo.innerHTML = '';
    logo.appendChild(img);
    logo.classList.add('has-img');
  } else {
    logo.innerHTML = `<span>${esc(CONFIG.LOGO_TEXT)}</span>`;
  }
})();

const setBanner = () => {
  const info = theme.shabbatInfo();
  document.getElementById('bannerText').textContent = info && info.isHoliday ? CONFIG.HOLIDAY_BANNER : CONFIG.SHABBAT_BANNER;
};

theme.onMode(guard('banner', setBanner));
theme.onMode(guard('shabbat-card', renderShabbatCard));
guard('preview', theme.initPreview)();
guard('theme', theme.evaluate)();
guard('zmanim', renderZmanim)(true);
guard('shabbat-card', renderShabbatCard)();
guard('banner', setBanner)();

onTick(guard('theme', theme.evaluate));
onTick(guard('zmanim', () => renderZmanim(false)));
onTick(guard('shabbat-card', renderShabbatCard));
onNewDay(guard('new-day', () => {
  shabbat.invalidate();
  renderZmanim(true);
  renderShabbatCard();
}));

guard('clock', initClock)();
guard('weather', initWeather)();
guard('notices', initNotices)();
guard('photos', initPhotos)();

document.fonts.ready.then(() => {
  guard('news', initNews)();
  document.body.classList.add('ready');
});

guard('updater', initUpdater)();
