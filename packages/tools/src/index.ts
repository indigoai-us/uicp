/**
 * UICP Tools - Framework-agnostic AI tools for component discovery and creation
 * @module @uicp/tools
 */

// Export types
export type {
  ComponentDefinition,
  InputSchema,
  Definitions,
  GetUIComponentsResult,
  GetUIComponentsParams,
  CreateUIComponentResult,
  CreateUIComponentParams,
} from './types';

// Export tool functions
export { getUIComponents, createUIComponent } from './tools';

// Export schemas
export {
  getUIComponentsSchema,
  createUIComponentSchema,
  type GetUIComponentsInput,
  type CreateUIComponentInput,
} from './schemas';

// Export cache utilities
export {
  getCached,
  setCached,
  clearCache,
  getCacheStats,
  DEFAULT_CACHE_TTL,
} from './cache';

// Export definitions loader
export { loadDefinitions } from './definitions-loader';

