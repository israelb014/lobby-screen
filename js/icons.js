// Inline SVG icons in the Lucide style (24x24, stroke 2, round caps/joins).
const P = {
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  sunrise: '<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>',
  candles: '<rect x="5" y="10" width="4" height="10" rx="1"/><rect x="15" y="10" width="4" height="10" rx="1"/><path d="M7 3c1.2 1.3 1.2 2.9 0 4-1.2-1.1-1.2-2.7 0-4Z"/><path d="M17 3c1.2 1.3 1.2 2.9 0 4-1.2-1.1-1.2-2.7 0-4Z"/><path d="M3 22h18"/>',
  newspaper: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
  mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  // weather
  sun: '<g class="i-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  cloudSun: '<g class="i-sun"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/></g><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>',
  cloudMoon: '<g class="i-sun"><path d="M10.188 8.5A6 6 0 0 1 16 4a4 4 0 0 0 6 6 6 6 0 0 1-3 5.197"/></g><path d="M13 16a3 3 0 1 1 0 6H7a5 5 0 1 1 4.9-6Z"/>',
  rain: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><g class="i-drop"><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></g>',
  drizzle: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><g class="i-drop"><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></g>',
  thunder: '<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><g class="i-sun"><path d="m13 12-3 5h4l-3 5"/></g>',
  fog: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/>',
  snow: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><g class="i-drop"><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></g>',
  moon: '<g class="i-sun"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></g>',
};

export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
}

/** WMO weather code -> Hebrew description + icon name. */
export function wmo(code, isDay = true) {
  const c = Number(code);
  const clear = isDay ? 'sun' : 'moon';
  const partly = isDay ? 'cloudSun' : 'cloudMoon';
  if (c === 0) return { text: 'בהיר', icon: clear };
  if (c === 1) return { text: 'בהיר ברובו', icon: clear };
  if (c === 2) return { text: 'מעונן חלקית', icon: partly };
  if (c === 3) return { text: 'מעונן', icon: 'cloud' };
  if (c === 45 || c === 48) return { text: 'ערפל', icon: 'fog' };
  if (c >= 51 && c <= 57) return { text: 'טפטוף', icon: 'drizzle' };
  if (c === 61) return { text: 'גשם קל', icon: 'rain' };
  if (c === 63) return { text: 'גשם', icon: 'rain' };
  if (c === 65) return { text: 'גשם חזק', icon: 'rain' };
  if (c === 66 || c === 67) return { text: 'גשם קפוא', icon: 'rain' };
  if (c >= 71 && c <= 77) return { text: 'שלג', icon: 'snow' };
  if (c >= 80 && c <= 82) return { text: 'ממטרים', icon: 'rain' };
  if (c === 85 || c === 86) return { text: 'ממטרי שלג', icon: 'snow' };
  if (c === 95) return { text: 'סופת רעמים', icon: 'thunder' };
  if (c === 96 || c === 99) return { text: 'סופת רעמים וברד', icon: 'thunder' };
  return { text: '—', icon: 'cloud' };
}
