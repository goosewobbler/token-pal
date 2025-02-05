interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly TTL: number = 4 * 60 * 60 * 1000; // 4 hours cache duration (4 * 60 * 60 * 1000ms)

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new APICache();
