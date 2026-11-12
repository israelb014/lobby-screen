// Building photos (crossfade + slow Ken Burns) and the fixed landscape / candles images.
import { CONFIG } from './config.js';
import { guard, photoUrl, safeImg, store } from './util.js';
import { loadPhotos } from './content.js';
import { isShabbat, onMode } from './theme.js';

let list = [];
let idx = 0;
let box;

function show(i) {
  const imgs = [...box.querySelectorAll('img')];
  if (!imgs.length) return;
  // skip images that failed to load
  for (let tries = 0; tries < imgs.length; tries++) {
    const k = (((i + tries) % imgs.length) + imgs.length) % imgs.length;
    if (!imgs[k].classList.contains('broken')) { i = k; break; }
  }
  idx = ((i % imgs.length) + imgs.length) % imgs.length;
  imgs.forEach((img, k) => {
    if (k === idx) {
      img.classList.remove('kb');
      void img.offsetWidth; // restart the Ken Burns animation
      img.classList.add('active');
      if (!isShabbat()) img.classList.add('kb');
    } else if (img.classList.contains('active')) {
      img.classList.remove('active');
      setTimeout(() => { if (!img.classList.contains('active')) img.classList.remove('kb'); }, 2000);
    }
  });
}

function render() {
  box.querySelectorAll('img').forEach((n) => n.remove());
  for (const name of list) box.appendChild(safeImg(photoUrl(name), 'bimg'));
  idx = 0;
  show(0);
}

async function refresh() {
  if (isShabbat()) {
    // no network during Shabbat: show the last known photos
    if (!box.querySelector('img')) { list = store.get('photos') || CONFIG.DEFAULT_BUILDING_PHOTOS; render(); }
    return;
  }
  const next = await loadPhotos();
  if (JSON.stringify(next) === JSON.stringify(list) && box.querySelector('img')) return;
  list = next;
  render();
}

export async function initPhotos() {
  box = document.getElementById('building');
  document.getElementById('beach').appendChild(safeImg(photoUrl(CONFIG.LANDSCAPE_PHOTO), 'fimg'));
  document.getElementById('candles').appendChild(safeImg(photoUrl(CONFIG.CANDLES_PHOTO), 'cimg'));
  onMode(guard('photos', (m) => {
    if (m === 'shabbat') show(0); // static first photo, no Ken Burns
    else show(idx);
  }));
  await guard('photos', refresh)();
  setInterval(guard('photos', refresh), CONFIG.CONTENT_REFRESH_MS);
  setInterval(guard('photos', () => { if (!isShabbat() && list.length > 1) show(idx + 1); }), CONFIG.PHOTO_ROTATE_MS);
}
