/**
 * Ready-to-use React components for UICP rendering
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { Definitions, ParsedContent } from './types';
import { parseUICPContentSync, hasUICPBlocks } from './parser';
import { loadDefinitionsWithCache } from './definitions-loader';

/**
 * Props for UICPContent component
 */
export interface UICPContentProps {
  /**
   * Content to parse and render (may contain UICP blocks)
   */
  content: string;
  
  /**
   * Component definitions
   */
  definitions: string | Definitions;
  
  /**
   * Base path for component imports
   * @default '/components/uicp'
   */
  componentsBasePath?: string;
  
  /**
   * Custom renderer for text content
   * @default renders as plain div
   */
  textRenderer?: (text: string) => ReactNode;
  
  /**
   * Custom wrapper for component items
   * @default renders components directly
   */
  componentWrapper?: (component: React.ReactElement) => ReactNode;
  
  /**
   * Loading component to show while parsing
   */
  loading?: ReactNode;
  
  /**
   * Fallback component if parsing fails
   */
  fallback?: ReactNode;
}

/**
 * Simplified component for rendering UICP content
 * 
 * Automatically handles:
 * - Parsing UICP blocks
 * - Loading components dynamically
 * - Rendering mixed text/component content
 * 
 * @example
 * ```tsx
 * import { UICPContent } from '@uicp/parser';
 * 
 * function Message({ content }) {
 *   return (
 *     <UICPContent
 *       content={content}
 *       definitions="/lib/uicp/definitions.json"
 *       componentsBasePath="/components/uicp"
 *       textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
 *     />
 *   );
 * }
 * ```
 */
export function UICPContent({
  content,
  definitions,
  componentsBasePath = '/components/uicp',
  textRenderer,
  componentWrapper,
  loading,
  fallback,
}: UICPContentProps) {
  const [parsed, setParsed] = useState<ParsedContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const parse = async () => {
      // If no UICP blocks, render text directly
      if (!hasUICPBlocks(content)) {
        if (mounted) {
          setParsed([{ type: 'text', content, key: 'text-0' }]);
        }
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Load definitions if provided as string
        let defs: Definitions;
        if (typeof definitions === 'string') {
          defs = await loadDefinitionsWithCache(definitions);
        } else {
          defs = definitions;
        }
        
        // Use sync parsing with pre-registered components
        // This works better with bundlers like Next.js, Vite, etc.
        const result = parseUICPContentSync(content, defs);
        
        if (mounted) {
          setParsed(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          // Fallback to showing raw content on error
          setParsed([{ type: 'text', content, key: 'text-0' }]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    parse();
    
    return () => {
      mounted = false;
    };
  }, [content, definitions, componentsBasePath]);
  
  if (isLoading && loading) {
    return <>{loading}</>;
  }
  
  if (error && fallback) {
    return <>{fallback}</>;
  }
  
  const defaultTextRenderer = (text: string) => <div>{text}</div>;
  const textRenderFn = textRenderer || defaultTextRenderer;
  
  const defaultComponentWrapper = (comp: React.ReactElement) => comp;
  const componentWrapperFn = componentWrapper || defaultComponentWrapper;
  
  return (
    <>
      {parsed.map((item) => {
        if (item.type === 'text') {
          return <React.Fragment key={item.key}>
            {textRenderFn(item.content as string)}
          </React.Fragment>;
        } else {
          return <React.Fragment key={item.key}>
            {componentWrapperFn(item.content as React.ReactElement)}
          </React.Fragment>;
        }
      })}
    </>
  );
}

/**
 * Props for UICPProvider
 */
export interface UICPProviderProps {
  /**
   * Component definitions
   */
  definitions: string | Definitions;
  
  /**
   * Base path for component imports
   * @default '/components/uicp'
   */
  componentsBasePath?: string;
  
  /**
   * Child components
   */
  children: ReactNode;
}

const UICPContext = React.createContext<{
  definitions: string | Definitions;
  componentsBasePath: string;
} | null>(null);

/**
 * Provider component for UICP configuration
 * 
 * Wrap your app or chat section with this to provide config to all UICPContent components
 * 
 * @example
 * ```tsx
 * <UICPProvider 
 *   definitions="/lib/uicp/definitions.json"
 *   componentsBasePath="/components/uicp"
 * >
 *   <ChatInterface />
 * </UICPProvider>
 * ```
 */
export function UICPProvider({ 
  definitions, 
  componentsBasePath = '/components/uicp', 
  children 
}: UICPProviderProps) {
  const value = React.useMemo(
    () => ({ definitions, componentsBasePath }),
    [definitions, componentsBasePath]
  );
  
  return (
    <UICPContext.Provider value={value}>
      {children}
    </UICPContext.Provider>
  );
}

/**
 * Hook to access UICP context
 */
export function useUICPContext() {
  const context = React.useContext(UICPContext);
  if (!context) {
    throw new Error('useUICPContext must be used within a UICPProvider');
  }
  return context;
}

