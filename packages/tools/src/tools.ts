/**
 * Core tool functions for UICP component discovery and creation
 */

import { loadDefinitions } from './definitions-loader';
import { getCached, setCached, DEFAULT_CACHE_TTL } from './cache';
import {
  GetUIComponentsParams,
  GetUIComponentsResult,
  CreateUIComponentParams,
  CreateUIComponentResult,
} from './types';

/**
 * Discover available UI components
 * 
 * @param definitionsUri - URI to definitions.json (URL or file path)
 * @param params - Filter parameters (component_type or uid)
 * @param cacheTtl - Cache TTL in milliseconds (default: 5 minutes)
 */
export async function getUIComponents(
  definitionsUri: string,
  params: GetUIComponentsParams = {},
  cacheTtl: number = DEFAULT_CACHE_TTL
): Promise<GetUIComponentsResult> {
  try {
    // Try cache first
    let definitions = getCached(definitionsUri, cacheTtl);
    
    if (!definitions) {
      // Load from source
      definitions = await loadDefinitions(definitionsUri);
      setCached(definitionsUri, definitions);
    }

    // Filter components based on parameters
    let components = definitions.components;

    if (params.uid) {
      components = components.filter((c) => c.uid === params.uid);
    } else if (params.component_type) {
      components = components.filter((c) => c.type === params.component_type);
    }

    if (components.length === 0) {
      return {
        success: false,
        message: params.uid
          ? `No component found with UID: ${params.uid}`
          : params.component_type
            ? `No components found with type: ${params.component_type}`
            : 'No components available',
        available_types: [...new Set(definitions.components.map((c) => c.type))],
      };
    }

    return {
      success: true,
      version: definitions.version,
      components: components.map((c) => ({
        uid: c.uid,
        type: c.type,
        description: c.description,
        inputs: c.inputs,
        example: c.example,
      })),
      usage: {
        instructions:
          'Use createUIComponent to generate a UICP block with the component data',
        format:
          'UICP blocks are code blocks with ```uicp prefix containing JSON with uid and data',
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to load component definitions: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Create a UICP block for a component
 * 
 * @param definitionsUri - URI to definitions.json (URL or file path)
 * @param params - Component UID and data
 * @param cacheTtl - Cache TTL in milliseconds (default: 5 minutes)
 */
export async function createUIComponent(
  definitionsUri: string,
  params: CreateUIComponentParams,
  cacheTtl: number = DEFAULT_CACHE_TTL
): Promise<CreateUIComponentResult> {
  try {
    // Try cache first
    let definitions = getCached(definitionsUri, cacheTtl);
    
    if (!definitions) {
      // Load from source
      definitions = await loadDefinitions(definitionsUri);
      setCached(definitionsUri, definitions);
    }

    // Find the component definition
    const component = definitions.components.find((c) => c.uid === params.uid);

    if (!component) {
      return {
        success: false,
        error: `Unknown component UID: ${params.uid}`,
        available_components: definitions.components.map((c) => c.uid),
      };
    }

    // Validate required fields
    const missingFields: string[] = [];
    Object.entries(component.inputs).forEach(([key, schema]) => {
      if (schema.required && !(key in params.data)) {
        missingFields.push(key);
      }
    });

    if (missingFields.length > 0) {
      return {
        success: false,
        error: 'Missing required fields',
        missing_fields: missingFields,
        component_schema: component.inputs,
      };
    }

    // Create the UICP block
    const uicpBlock = {
      uid: params.uid,
      data: params.data,
    };

    // Return the formatted UICP code block as a string
    const formattedBlock =
      '```uicp\n' + JSON.stringify(uicpBlock, null, 2) + '\n```';

    return {
      success: true,
      message: `Successfully created ${component.type} component: ${params.uid}`,
      uicp_block: formattedBlock,
      instructions: {
        usage: 'Include the uicp_block string directly in your response text',
        note: 'The UICP block will be automatically parsed and rendered as a visual component',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to create component: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

