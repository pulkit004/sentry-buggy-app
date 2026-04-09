/**
 * In-memory cache with NO eviction policy.
 * BUG 4: Unbounded cache growth — every unique key is stored forever.
 * In production, this causes "JavaScript heap out of memory" crashes.
 */

const cache = new Map<string, { data: unknown; timestamp: number }>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  // No TTL check — data never expires
  return entry.data as T;
}

export function cacheSet(key: string, data: unknown): void {
  // No size limit — cache grows forever
  cache.set(key, { data, timestamp: Date.now() });
}

export function cacheSize(): number {
  return cache.size;
}

/**
 * Generate a cache key from query parameters.
 * Each unique combination of params creates a new cache entry.
 */
export function buildCacheKey(
  prefix: string,
  params: Record<string, string>,
): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${prefix}:${sorted}`;
}
