/**
 * Zod schemas for tool parameters
 */

import { z } from 'zod';

/**
 * Schema for getUIComponents parameters
 */
export const getUIComponentsSchema = z.object({
  component_type: z
    .string()
    .optional()
    .describe('Filter by component type (e.g., "sports", "chart", "card")'),
  uid: z
    .string()
    .optional()
    .describe('Get a specific component by its unique identifier'),
});

/**
 * Schema for createUIComponent parameters
 */
export const createUIComponentSchema = z.object({
  uid: z
    .string()
    .describe('The unique identifier of the component (e.g., "SimpleCard")'),
  data: z
    .record(z.any())
    .describe(
      'The data object containing all required and optional fields for the component'
    ),
});

/**
 * Type inference from schemas
 */
export type GetUIComponentsInput = z.infer<typeof getUIComponentsSchema>;
export type CreateUIComponentInput = z.infer<typeof createUIComponentSchema>;

