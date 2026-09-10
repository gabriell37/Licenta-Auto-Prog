import { TZDate } from '@date-fns/tz';

/**
 * All shop scheduling happens in Romania's timezone, regardless of where the
 * server runs (a UTC prod box would otherwise shift days/hours by 2-3h).
 */
export const APP_TZ = 'Europe/Bucharest';

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Romania-local calendar date of an instant, as a `YYYY-MM-DD` key. */
export function dayKey(d: Date): string {
  const z = new TZDate(d.getTime(), APP_TZ);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`;
}

/**
 * Normalize a client-supplied date param (either a `YYYY-MM-DD` key or a full
 * ISO datetime) to a day key. Returns null for garbage input.
 */
export function toDayKey(input: string | null | undefined): string | null {
  if (!input) return null;
  if (DAY_KEY_RE.test(input)) return input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : dayKey(d);
}

/** UTC instant of Romania-local midnight for a `YYYY-MM-DD` key. */
export function dayStart(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(new TZDate(y!, m! - 1, d!, 0, 0, 0, 0, APP_TZ).getTime());
}

/** UTC instant of Romania-local end-of-day for a `YYYY-MM-DD` key. */
export function dayEnd(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(new TZDate(y!, m! - 1, d!, 23, 59, 59, 999, APP_TZ).getTime());
}

/** Romania-local weekday (0=Sunday … 6=Saturday) of a day key. */
export function weekdayOf(key: string): number {
  return new TZDate(dayStart(key).getTime(), APP_TZ).getDay();
}

/** UTC instant of `HH:MM` Romania-local time on the given day key. */
export function atTime(key: string, hm: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  const [h, min] = hm.split(':').map(Number);
  return new Date(new TZDate(y!, m! - 1, d!, h ?? 0, min ?? 0, 0, 0, APP_TZ).getTime());
}

/** Day key shifted by `n` calendar days (DST-safe: arithmetic on the local calendar). */
export function addDaysKey(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const z = new TZDate(y!, m! - 1, d!, 12, 0, 0, 0, APP_TZ); // noon avoids DST edge
  z.setDate(z.getDate() + n);
  return dayKey(new Date(z.getTime()));
}

/** Romania-local minutes since midnight for an instant (for calendar layout). */
export function minutesOfDay(d: Date): number {
  const z = new TZDate(d.getTime(), APP_TZ);
  return z.getHours() * 60 + z.getMinutes();
}

/** Monday-start week begin (Romania-local) for an instant, as a UTC instant. */
export function weekStart(d: Date): Date {
  const key = dayKey(d);
  const dow = (weekdayOf(key) + 6) % 7; // 0 = Monday
  return dayStart(addDaysKey(key, -dow));
}
