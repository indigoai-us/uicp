/**
 * In-memory cache for definitions
 */

import { Definitions } from './types';

/**
 * Cache entry
 */
interface CacheEntry {
  data: Definitions;
  timestamp: number;
}

/**
 * Simple in-memory cache
 */
const cache = new Map<string, CacheEntry>();

/**
 * Default TTL: 5 minutes
 */
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Get cached definitions if not expired
 */
export function getCached(uri: string, ttl: number = DEFAULT_CACHE_TTL): Definitions | null {
  const entry = cache.get(uri);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > ttl) {
    cache.delete(uri);
    return null;
  }

  return entry.data;
}

/**
 * Store definitions in cache
 */
export function setCached(uri: string, data: Definitions): void {
  cache.set(uri, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear cache for a specific URI or all entries
 */
export function clearCache(uri?: string): void {
  if (uri) {
    cache.delete(uri);
  } else {
    cache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}

