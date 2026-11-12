// Resident notices card: crossfade every 12s, progress dots, "1 / 3", auto-fit text.
import { CONFIG } from './config.js';
import { guard, esc, store } from './util.js';
import { loadNotices } from './content.js';
import { isShabbat, onMode, shabbatInfo } from './theme.js';

const MAX_BODY = 30;
const MIN_BODY = 24;

let list = [];
let idx = 0;
let timer = 0;
let slidesEl;

function fit(slide) {
  const body = slide.querySelector('.nbody');
  const title = slide.querySelector('.ntitle');
  const over = () => slide.scrollHeight > slide.clientHeight + 1;
  // keep the title on one line if possible (35px down to 28px)
  let ts = 35;
  title.style.fontSize = ts + 'px';
  while (title.offsetHeight > ts * 1.6 && ts > 28) title.style.fontSize = --ts + 'px';
  let size = MAX_BODY;
  body.style.fontSize = size + 'px';
  while (over() && size > MIN_BODY) body.style.fontSize = --size + 'px';
  if (!over()) return;
  // still too long at the minimum size: cut words and add an ellipsis
  const truncate = (el) => {
    const words = el.textContent.split(/\s+/);
    let lo = 0;
    let hi = words.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      el.textContent = words.slice(0, mid).join(' ') + '…';
      if (over()) hi = mid - 1; else lo = mid;
    }
    el.textContent = lo ? words.slice(0, lo).join(' ') + '…' : '';
  };
  truncate(body);
  if (over()) truncate(title);
}

function slideHtml(n) {
  return `<article class="nslide">${n.category ? `<span class="ntag">${esc(n.category)}</span>` : ''}`
    + `<h2 class="ntitle">${esc(n.title)}</h2><p class="nbody">${esc(n.body)}</p></article>`;
}

function renderFooter() {
  const foot = document.getElementById('nfoot');
  foot.hidden = list.length < 2 || isShabbat();
  document.getElementById('ncount').textContent = `${idx + 1} / ${list.length}`;
  document.getElementById('ndots').innerHTML = list.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('');
}

function show(i) {
  const slides = slidesEl.children;
  if (!slides.length) return;
  idx = ((i % slides.length) + slides.length) % slides.length;
  for (let k = 0; k < slides.length; k++) slides[k].classList.toggle('active', k === idx);
  renderFooter();
}

function renderList(items) {
  slidesEl.innerHTML = items.map(slideHtml).join('');
  for (const s of slidesEl.children) guard('notice-fit', fit)(s);
  show(idx < items.length ? idx : 0);
}

function renderShabbat() {
  const info = shabbatInfo();
  const n = info && info.isHoliday ? CONFIG.HOLIDAY_NOTICE : CONFIG.SHABBAT_NOTICE;
  slidesEl.innerHTML = slideHtml(n);
  guard('notice-fit', fit)(slidesEl.firstElementChild);
  slidesEl.firstElementChild.classList.add('active');
  document.getElementById('nfoot').hidden = true;
}

function rerender() {
  if (isShabbat()) renderShabbat();
  else renderList(list);
}

async function refresh() {
  if (isShabbat()) return;
  const next = await loadNotices();
  if (JSON.stringify(next) === JSON.stringify(list) && slidesEl.children.length) return;
  list = next;
  await document.fonts.ready;
  rerender();
}

function rotate() {
  if (isShabbat() || list.length < 2) return;
  show(idx + 1);
}

export async function initNotices() {
  slidesEl = document.getElementById('noticeSlides');
  onMode(guard('notices', rerender));
  list = store.get('notices') || [];
  await document.fonts.ready;
  guard('notices', rerender)();
  await guard('notices', refresh)();
  setInterval(guard('notices', refresh), CONFIG.CONTENT_REFRESH_MS);
  timer = setInterval(guard('notices', rotate), CONFIG.NOTICE_ROTATE_MS);
  return timer;
}
