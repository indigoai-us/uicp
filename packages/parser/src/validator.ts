/**
 * Validation logic for UICP blocks
 */

import { UICPBlock, Definitions, ValidationResult } from './types';

/**
 * Validates a UICP block against component definitions
 */
export function validateUICPBlock(
  block: UICPBlock,
  definitions: Definitions
): ValidationResult {
  const errors: string[] = [];

  // Check if component exists
  const component = definitions.components.find((c) => c.uid === block.uid);
  if (!component) {
    errors.push(`Unknown component UID: ${block.uid}`);
    return { valid: false, errors };
  }

  // Check required fields
  Object.entries(component.inputs).forEach(([key, schema]) => {
    if (schema.required && !(key in block.data)) {
      errors.push(`Missing required field: ${key}`);
    }
  });

  // Basic type checking
  Object.entries(block.data).forEach(([key, value]) => {
    const schema = component.inputs[key];
    if (!schema) {
      // Unknown field - could warn but not error
      return;
    }

    // Check enum values if defined
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(
        `Invalid value for ${key}: must be one of ${schema.enum.join(', ')}`
      );
    }

    // Basic type checking
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (schema.type !== actualType && value !== null && value !== undefined) {
      errors.push(
        `Invalid type for ${key}: expected ${schema.type}, got ${actualType}`
      );
    }
  });

  return { valid: errors.length === 0, errors };
}

