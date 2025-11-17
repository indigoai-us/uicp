/**
 * Simplified React hook for UICP parsing
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Definitions, ParsedContent } from './types';
import { parseUICPContent, hasUICPBlocks } from './parser';
import { loadDefinitionsWithCache } from './definitions-loader';

/**
 * Configuration for UICP parser hook
 */
export interface UseUICPParserConfig {
  /**
   * Path or URL to definitions.json, or the definitions object itself
   */
  definitions: string | Definitions;
  
  /**
   * Base path for component imports
   * @default '/components/uicp'
   */
  componentsBasePath?: string;
}

/**
 * Result from the useUICPParser hook
 */
export interface UseUICPParserResult {
  /**
   * Parse content and return mixed text/component array
   */
  parse: (content: string) => Promise<ParsedContent[]>;
  
  /**
   * Check if content contains UICP blocks
   */
  hasBlocks: (content: string) => boolean;
  
  /**
   * Loaded definitions
   */
  definitions: Definitions | null;
  
  /**
   * Whether definitions are still loading
   */
  isLoading: boolean;
  
  /**
   * Error if definitions failed to load
   */
  error: Error | null;
}

/**
 * Simplified hook for UICP parsing
 * 
 * Configure once at the app level, then use the parse function anywhere
 * 
 * @example
 * ```tsx
 * // In your message component
 * const { parse } = useUICPParser({
 *   definitions: '/lib/uicp/definitions.json',
 *   componentsBasePath: '/components/uicp'
 * });
 * 
 * const parsedContent = await parse(message.content);
 * ```
 */
export function useUICPParser(config: UseUICPParserConfig): UseUICPParserResult {
  const [definitions, setDefinitions] = useState<Definitions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const componentsBasePath = config.componentsBasePath || '/components/uicp';
  
  // Load definitions once
  useEffect(() => {
    let mounted = true;
    
    const loadDefs = async () => {
      try {
        setIsLoading(true);
        const defs = await loadDefinitionsWithCache(config.definitions);
        if (mounted) {
          setDefinitions(defs);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDefs();
    
    return () => {
      mounted = false;
    };
  }, [config.definitions]);
  
  // Memoized parse function
  const parse = useCallback(async (content: string): Promise<ParsedContent[]> => {
    if (!definitions) {
      return [{ type: 'text', content, key: 'text-0' }];
    }
    
    return parseUICPContent(content, {
      definitions,
      componentsBasePath,
    });
  }, [definitions, componentsBasePath]);
  
  // Memoized hasBlocks function
  const hasBlocksFn = useCallback((content: string): boolean => {
    return hasUICPBlocks(content);
  }, []);
  
  return useMemo(() => ({
    parse,
    hasBlocks: hasBlocksFn,
    definitions,
    isLoading,
    error,
  }), [parse, hasBlocksFn, definitions, isLoading, error]);
}

