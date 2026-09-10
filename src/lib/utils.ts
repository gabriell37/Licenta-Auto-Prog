import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format integer bani (1 RON = 100 bani) as RON currency, ro-RO. */
export function formatRON(bani: number | null | undefined, opts?: { from?: boolean }): string {
  const value = (bani ?? 0) / 100;
  const formatted = new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
  return opts?.from ? `de la ${formatted}` : formatted;
}

/** Parse a RON string/number to integer bani. */
export function toBani(ron: number | string): number {
  const n = typeof ron === 'string' ? parseFloat(ron.replace(',', '.')) : ron;
  return Math.round((isNaN(n) ? 0 : n) * 100);
}

// All user-facing times are Romania-local regardless of server timezone.
const APP_TZ = 'Europe/Bucharest';
const dtf = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: APP_TZ,
});
const df = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: APP_TZ,
});
const tf = new Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: APP_TZ });

export function formatDateTime(d: Date | string): string {
  return dtf.format(new Date(d));
}
export function formatDate(d: Date | string): string {
  return df.format(new Date(d));
}
export function formatTime(d: Date | string): string {
  return tf.format(new Date(d));
}

/** "în 3 zile" / "acum 2 ore" style relative time, RO. */
export function relativeTime(d: Date | string): string {
  const date = new Date(d);
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat('ro-RO', { numeric: 'auto' });
  const min = 60_000,
    hour = 60 * min,
    day = 24 * hour;
  if (abs < hour) return rtf.format(Math.round(diff / min), 'minute');
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour');
  return rtf.format(Math.round(diff / day), 'day');
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Safe JSON parse for the String-stored arrays/objects in the schema. */
export function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
