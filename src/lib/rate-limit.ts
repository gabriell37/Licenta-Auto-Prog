import 'server-only';

/**
 * Minimal in-memory sliding-window rate limiter. Per-process only — enough to
 * blunt credential brute-force on a single-instance deploy; swap for a shared
 * store (Redis) when scaling horizontally.
 */
type Bucket = { times: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      // drop the oldest entries wholesale rather than grow unbounded
      const firstKey = buckets.keys().next().value;
      if (firstKey) buckets.delete(firstKey);
    }
    bucket = { times: [] };
    buckets.set(key, bucket);
  }
  bucket.times = bucket.times.filter((t) => now - t < windowMs);
  if (bucket.times.length >= limit) return false;
  bucket.times.push(now);
  return true;
}

/** Clear the window for a key (e.g. after a successful login). */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}
