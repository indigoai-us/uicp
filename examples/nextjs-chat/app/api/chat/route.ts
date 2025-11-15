import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getUIComponents, createUIComponent } from '@uicp/tools';
import { resolve } from 'path';

// Get the path to definitions.json
const definitionsPath = resolve(
  process.cwd(),
  'lib/uicp/definitions.json'
);

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai(process.env.OPENAI_MODEL || 'gpt-4o'),
    system: `You are a helpful AI assistant that can create rich UI components using UICP (UI Component Protocol).

When appropriate, you can use UI components to make your responses more engaging and visual. You have access to tools for discovering available components and creating them.

Available component types:
- SimpleCard: For displaying information in a card format
- DataTable: For showing tabular data

Use these components when they make the information clearer or more organized. Always explain what you're showing in plain text along with the component.`,
    messages,
    tools: {
      get_ui_components: tool({
        description: `Discover available UI components. Use this to find out what components you can use and their schemas.`,
        parameters: z.object({
          component_type: z
            .string()
            .optional()
            .describe('Filter by type (e.g., "card", "table")'),
          uid: z
            .string()
            .optional()
            .describe('Get specific component by UID'),
        }),
        execute: async ({ component_type, uid }) => {
          return await getUIComponents(definitionsPath, {
            component_type,
            uid,
          });
        },
      }),
      create_ui_component: tool({
        description: `Create a UICP block for rendering a UI component. First use get_ui_components to discover available components and their schemas.`,
        parameters: z.object({
          uid: z.string().describe('Component UID (e.g., "SimpleCard")'),
          data: z
            .record(z.any())
            .describe('Component data with all required fields'),
        }),
        execute: async ({ uid, data }) => {
          return await createUIComponent(definitionsPath, { uid, data });
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}

