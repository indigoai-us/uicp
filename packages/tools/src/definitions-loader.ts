/**
 * Load component definitions from various sources
 */

import { Definitions } from './types';

/**
 * Load definitions from a URI (URL or file path)
 */
export async function loadDefinitions(
  definitionsUri: string
): Promise<Definitions> {
  // If it's a URL, fetch it
  if (
    definitionsUri.startsWith('http://') ||
    definitionsUri.startsWith('https://')
  ) {
    const response = await fetch(definitionsUri);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch definitions from ${definitionsUri}: ${response.statusText}`
      );
    }
    return response.json() as Promise<Definitions>;
  }

  // If it's a file path, we need to check environment
  if (typeof globalThis.window === 'undefined') {
    // Node.js environment
    const { readFile } = await import('fs/promises');
    const { resolve } = await import('path');

    try {
      const fullPath = resolve(definitionsUri);
      const content = await readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to read definitions from file ${definitionsUri}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  } else {
    // Browser environment - try to fetch as relative URL
    try {
      const response = await fetch(definitionsUri);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json() as Promise<Definitions>;
    } catch (error) {
      throw new Error(
        `Failed to load definitions from ${definitionsUri}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

