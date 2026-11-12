// RFC 4180 CSV parser: quoted fields, commas, escaped quotes and newlines inside cells.
export function parseCSV(text) {
  text = String(text || '').replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim() !== ''));
}

const YES = new Set(['כן', 'yes', 'true', '1', 'v', '✓', 'פעיל']);
export const isActive = (v) => YES.has(String(v || '').trim().toLowerCase());

/** Drop a header row if its first cell is the column title. */
export function dropHeader(rows) {
  if (rows.length && /פעיל|active/i.test(String(rows[0][0] || '').trim())) return rows.slice(1);
  return rows;
}
