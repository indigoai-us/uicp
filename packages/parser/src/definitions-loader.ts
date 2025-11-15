/**
 * Utilities for loading component definitions from various sources
 */

import { Definitions } from './types';

/**
 * Load definitions from a URI (URL or file path) or return object directly
 */
export async function loadDefinitions(
  source: string | Definitions
): Promise<Definitions> {
  // If it's already an object, return it
  if (typeof source === 'object') {
    return source;
  }

  // If it's a URL, fetch it
  if (source.startsWith('http://') || source.startsWith('https://')) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch definitions from ${source}: ${response.statusText}`
      );
    }
    return response.json();
  }

  // If it's a file path, we need to check if we're in Node.js or browser
  if (typeof window === 'undefined') {
    // Node.js environment - dynamic import to avoid bundling issues
    const { readFile } = await import('fs/promises');
    const { resolve } = await import('path');
    
    try {
      const fullPath = resolve(source);
      const content = await readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read definitions from file ${source}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    // Browser environment - try to fetch as relative URL
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      throw new Error(
        `Failed to load definitions from ${source}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

/**
 * Simple in-memory cache for definitions
 */
const definitionsCache = new Map<string, { data: Definitions; timestamp: number }>();

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Load definitions with caching
 */
export async function loadDefinitionsWithCache(
  source: string | Definitions,
  ttl: number = DEFAULT_CACHE_TTL
): Promise<Definitions> {
  // If it's an object, don't cache
  if (typeof source === 'object') {
    return source;
  }

  // Check cache
  const cached = definitionsCache.get(source);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  // Load fresh data
  const data = await loadDefinitions(source);

  // Store in cache
  definitionsCache.set(source, { data, timestamp: Date.now() });

  return data;
}

/**
 * Clear the definitions cache
 */
export function clearDefinitionsCache(source?: string): void {
  if (source) {
    definitionsCache.delete(source);
  } else {
    definitionsCache.clear();
  }
}

