/**
 * Lightweight in-memory rate limiter for the login endpoint.
 * Bounded map; evicts stale entries periodically to avoid unbounded growth.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const PRUNE_EVERY_MS = 5 * 60 * 1000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastPrune = Date.now();

export function pruneLoginRateBuckets(): void {
  const now = Date.now();
  if (now - lastPrune < PRUNE_EVERY_MS) return;
  lastPrune = now;
  for (const [k, b] of buckets) {
    if (now > b.resetAt + WINDOW_MS) buckets.delete(k);
  }
}

/** Returns false when rate limit exceeded. */
export function allowLoginAttempt(key: string): boolean {
  pruneLoginRateBuckets();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  bucket.count += 1;
  return bucket.count <= MAX_ATTEMPTS;
}
