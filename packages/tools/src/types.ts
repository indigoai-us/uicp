/**
 * Type definitions for UICP tools
 */

/**
 * Component definition structure
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
 * Input schema for component fields
 */
export interface InputSchema {
  type: string;
  description: string;
  required: boolean;
  default?: any;
  enum?: string[];
}

/**
 * Component definitions file structure
 */
export interface Definitions {
  version: string;
  components: ComponentDefinition[];
}

/**
 * Result from getUIComponents tool
 */
export interface GetUIComponentsResult {
  success: boolean;
  version?: string;
  components?: Array<{
    uid: string;
    type: string;
    description: string;
    inputs: Record<string, InputSchema>;
    example?: any;
  }>;
  usage?: {
    instructions: string;
    format: string;
  };
  message?: string;
  available_types?: string[];
}

/**
 * Parameters for getUIComponents
 */
export interface GetUIComponentsParams {
  component_type?: string;
  uid?: string;
}

/**
 * Result from createUIComponent tool
 */
export interface CreateUIComponentResult {
  success: boolean;
  message?: string;
  uicp_block?: string;
  error?: string;
  missing_fields?: string[];
  component_schema?: Record<string, InputSchema>;
  available_components?: string[];
  instructions?: {
    usage: string;
    note: string;
  };
}

/**
 * Parameters for createUIComponent
 */
export interface CreateUIComponentParams {
  uid: string;
  data: Record<string, any>;
}

