// Date helpers that work in the user's local timezone.
// The app used UTC ISO dates before, which put Kerala (UTC+5:30) a day behind
// until 05:30 local time — resetting checklists and logging growth on the wrong date.

const pad = n => String(n).padStart(2, '0');

export function isoLocal(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseIsoLocal(iso) {
  // Accept both 'YYYY-MM-DD' and a full timestamp by reading only the date part.
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso, days) {
  const d = parseIsoLocal(iso);
  d.setDate(d.getDate() + days);
  return d;
}

// Whole-day difference between two ISO dates, immune to time of day and DST.
export function daysBetween(fromIso, toIso = isoLocal()) {
  const a = parseIsoLocal(fromIso);
  const b = parseIsoLocal(toIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bUtc - aUtc) / 86400000);
}

export function formatIsoDate(iso) {
  const d = parseIsoLocal(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ISO week key (e.g. 2026-W45) computed from local calendar parts.
export function weekKey(iso = isoLocal()) {
  const d = parseIsoLocal(iso);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${pad(week)}`;
}
