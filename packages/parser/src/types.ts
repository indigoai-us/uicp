/**
 * Type definitions for UICP parser
 */

import { ComponentType, ReactElement } from 'react';

/**
 * A UICP block extracted from markdown
 */
export interface UICPBlock {
  uid: string;
  data: Record<string, any>;
}

/**
 * Parsed content item - either text or a rendered component
 */
export interface ParsedContent {
  type: 'text' | 'component';
  content: string | ReactElement;
  key: string;
}

/**
 * Component definition from definitions.json
 */
export interface ComponentDefinition {
  uid: string;
  type: string;
  description: string;
  componentPath: string;
  inputs: Record<string, InputSchema>;
  example?: any;
}

/**
 * Input schema for a component field
 */
export interface InputSchema {
  type: string;
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
}

/**
 * Component definitions structure
 */
export interface Definitions {
  version: string;
  components: ComponentDefinition[];
}

/**
 * Configuration for the parser
 */
export interface ParserConfig {
  /**
   * Base path for component imports (default: '/components/uicp')
   */
  componentsBasePath?: string;
  
  /**
   * Component definitions (as URI string or object)
   */
  definitions: string | Definitions;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Component registry type
 */
export type ComponentRegistry = Map<string, ComponentType<any>>;

