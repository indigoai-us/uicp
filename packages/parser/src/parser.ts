/**
 * Core UICP parsing logic
 */

import React from 'react';
import {
  UICPBlock,
  ParsedContent,
  Definitions,
  ParserConfig,
} from './types';
import { loadDefinitionsWithCache } from './definitions-loader';
import { validateUICPBlock } from './validator';
import { getComponent, loadComponent } from './loader';

/**
 * Extract UICP blocks from markdown text
 * Looks for ```uicp code blocks and parses the JSON inside
 * Truncates content at incomplete UICP blocks to prevent showing raw code
 */
export function extractUICPBlocks(content: string): {
  blocks: UICPBlock[];
  contentWithPlaceholders: string;
} {
  const blocks: UICPBlock[] = [];
  const uicpRegex = /```uicp\s*\n([\s\S]*?)```/g;
  let match;
  let contentWithPlaceholders = content;

  // First, handle complete blocks
  while ((match = uicpRegex.exec(content)) !== null) {
    try {
      const jsonContent = match[1].trim();
      const parsed = JSON.parse(jsonContent);

      if (parsed.uid && parsed.data) {
        const placeholderId = `__UICP_BLOCK_${blocks.length}__`;
        blocks.push(parsed);
        contentWithPlaceholders = contentWithPlaceholders.replace(
          match[0],
          placeholderId
        );
      }
    } catch (error) {
      console.error('[UICP] Failed to parse UICP block:', error);
      // Leave the original block in place if parsing fails
    }
  }

  // Check for incomplete UICP blocks (started but not finished)
  // If found, truncate content RIGHT BEFORE the incomplete block starts
  const incompleteBlockMatch = contentWithPlaceholders.match(/```uicp/);
  if (incompleteBlockMatch && incompleteBlockMatch.index !== undefined) {
    // Truncate everything from the start of the incomplete block
    // and trim trailing whitespace for clean display
    contentWithPlaceholders = contentWithPlaceholders
      .substring(0, incompleteBlockMatch.index)
      .trimEnd();
  }

  return { blocks, contentWithPlaceholders };
}

/**
 * Render a UICP block as a React component
 */
export function renderUICPBlock(
  block: UICPBlock,
  definitions: Definitions,
  key: string
): React.ReactElement | null {
  const { valid, errors } = validateUICPBlock(block, definitions);

  if (!valid) {
    return React.createElement(
      'div',
      {
        key,
        className: 'border border-red-500 bg-red-950 p-4 rounded-lg my-2',
      },
      React.createElement(
        'p',
        { className: 'text-red-400 font-semibold' },
        'Invalid UICP Component'
      ),
      React.createElement(
        'ul',
        { className: 'text-red-300 text-sm mt-2 list-disc list-inside' },
        errors.map((error, i) =>
          React.createElement('li', { key: i }, error)
        )
      )
    );
  }

  const Component = getComponent(block.uid);

  if (!Component) {
    return React.createElement(
      'div',
      {
        key,
        className: 'border border-yellow-500 bg-yellow-950 p-4 rounded-lg my-2',
      },
      React.createElement(
        'p',
        { className: 'text-yellow-400 font-semibold' },
        `Component Not Available: ${block.uid}`
      ),
      React.createElement(
        'p',
        { className: 'text-yellow-300 text-sm mt-2' },
        'This component needs to be loaded or registered'
      )
    );
  }

  return React.createElement(Component, { key, ...block.data });
}

/**
 * Main parser function that processes content with UICP blocks
 * Returns an array of text and component elements
 */
export async function parseUICPContent(
  content: string,
  config: ParserConfig
): Promise<ParsedContent[]> {
  // Load definitions
  const definitions = await loadDefinitionsWithCache(config.definitions);

  const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);

  if (blocks.length === 0) {
    return [{ type: 'text', content, key: 'text-0' }];
  }

  // Pre-load all components needed for this content
  const basePath = config.componentsBasePath || '/components/uicp';
  await Promise.all(
    blocks.map(async (block) => {
      const componentDef = definitions.components.find(
        (c) => c.uid === block.uid
      );
      if (componentDef && !getComponent(block.uid)) {
        await loadComponent(block.uid, componentDef.componentPath, basePath);
      }
    })
  );

  const result: ParsedContent[] = [];
  const parts = contentWithPlaceholders.split(/(__UICP_BLOCK_\d+__)/);

  parts.forEach((part, index) => {
    const placeholderMatch = part.match(/__UICP_BLOCK_(\d+)__/);

    if (placeholderMatch) {
      const blockIndex = parseInt(placeholderMatch[1], 10);
      const block = blocks[blockIndex];

      if (block) {
        const component = renderUICPBlock(
          block,
          definitions,
          `component-${blockIndex}`
        );
        if (component) {
          result.push({
            type: 'component',
            content: component,
            key: `component-${blockIndex}`,
          });
        }
      }
    } else if (part.trim()) {
      result.push({
        type: 'text',
        content: part,
        key: `text-${index}`,
      });
    }
  });

  return result;
}

/**
 * Synchronous version of parseUICPContent for when components are pre-registered
 */
export function parseUICPContentSync(
  content: string,
  definitions: Definitions
): ParsedContent[] {
  const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);

  if (blocks.length === 0) {
    return [{ type: 'text', content, key: 'text-0' }];
  }

  const result: ParsedContent[] = [];
  const parts = contentWithPlaceholders.split(/(__UICP_BLOCK_\d+__)/);

  parts.forEach((part, index) => {
    const placeholderMatch = part.match(/__UICP_BLOCK_(\d+)__/);

    if (placeholderMatch) {
      const blockIndex = parseInt(placeholderMatch[1], 10);
      const block = blocks[blockIndex];

      if (block) {
        const component = renderUICPBlock(
          block,
          definitions,
          `component-${blockIndex}`
        );
        if (component) {
          result.push({
            type: 'component',
            content: component,
            key: `component-${blockIndex}`,
          });
        }
      }
    } else if (part.trim()) {
      result.push({
        type: 'text',
        content: part,
        key: `text-${index}`,
      });
    }
  });

  return result;
}

/**
 * Helper function to check if content contains UICP blocks (complete or incomplete)
 */
export function hasUICPBlocks(content: string): boolean {
  return /```uicp/.test(content);
}

