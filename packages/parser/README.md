# @uicp/parser

Core parsing library for extracting and rendering UICP (User Interface Context Protocol) blocks from LLM output.

## Installation

```bash
npm install @uicp/parser
```

## Features

- **Extract UICP blocks** from markdown text
- **Validate blocks** against component definitions
- **Dynamic component loading** with configurable base path
- **React component rendering** with error handling
- **TypeScript support** with full type definitions
- **Caching** for definitions and components

## Quick Start

### ⭐ Simplified API (Recommended)

The easiest way to use UICP - just one component, automatic component loading:

```tsx
import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';

function Message({ content }) {
  return (
    <UICPContent
      content={content}
      definitions="/lib/uicp/definitions.json"
      componentsBasePath="/components/uicp"
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
    />
  );
}
```

**That's it!** Components are loaded automatically from your definitions file. No manual imports, no registration, no parsing logic.

### Advanced API

For more control, use the lower-level API:

```typescript
import {
  parseUICPContent,
  registerComponent,
  loadDefinitionsWithCache,
} from '@uicp/parser';
import { MyComponent } from './components/my-component';

// Register your component
registerComponent('MyComponent', MyComponent);

// Parse content
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});

// Render parsed content
parsed.forEach((item) => {
  if (item.type === 'component') {
    // Render React component
    return item.content;
  } else {
    // Render text
    return <Markdown>{item.content}</Markdown>;
  }
});
```

## API Reference

### Simplified API

#### `<UICPContent />`

Ready-to-use React component that handles everything automatically.

```tsx
<UICPContent
  content={message.content}
  definitions="/lib/uicp/definitions.json"
  componentsBasePath="/components/uicp"
  textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
  componentWrapper={(component) => <div className="my-2">{component}</div>}
  loading={<Spinner />}
  fallback={<ErrorMessage />}
/>
```

**Props:**
- `content: string` - Content to parse (may contain UICP blocks)
- `definitions: string | Definitions` - Path/URL to definitions or object
- `componentsBasePath?: string` - Base path for components (default: `/components/uicp`)
- `textRenderer?: (text: string) => ReactNode` - Custom text renderer
- `componentWrapper?: (component: ReactElement) => ReactNode` - Wrapper for components
- `loading?: ReactNode` - Show while parsing
- `fallback?: ReactNode` - Show on error

#### `useUICPParser(config)`

React hook for programmatic parsing with automatic component loading.

```tsx
const { parse, hasBlocks, definitions, isLoading, error } = useUICPParser({
  definitions: '/lib/uicp/definitions.json',
  componentsBasePath: '/components/uicp',
});

const parsedContent = await parse(message.content);
```

**Config:**
- `definitions: string | Definitions` - Path/URL to definitions or object
- `componentsBasePath?: string` - Base path for components (default: `/components/uicp`)

**Returns:**
- `parse: (content: string) => Promise<ParsedContent[]>` - Parse function
- `hasBlocks: (content: string) => boolean` - Check for UICP blocks
- `definitions: Definitions | null` - Loaded definitions
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if failed to load

#### `<UICPProvider />`

Optional provider for setting default config across your app.

```tsx
<UICPProvider 
  definitions="/lib/uicp/definitions.json"
  componentsBasePath="/components/uicp"
>
  <ChatInterface />
</UICPProvider>
```

### Core Functions (Advanced API)

#### `parseUICPContent(content, config)`

Parse content and return mixed text/component array.

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/components/uicp',
});
```

**Parameters:**
- `content: string` - Content with UICP blocks
- `config: ParserConfig` - Configuration object
  - `definitions: string | Definitions` - Path/URL to definitions or object
  - `componentsBasePath?: string` - Base path for component imports (default: `/components/uicp`)

**Returns:** `Promise<ParsedContent[]>`

#### `parseUICPContentSync(content, definitions)`

Synchronous version for pre-registered components.

```typescript
const parsed = parseUICPContentSync(content, definitions);
```

#### `hasUICPBlocks(content)`

Check if content contains UICP blocks.

```typescript
if (hasUICPBlocks(content)) {
  // Parse the content
}
```

#### `extractUICPBlocks(content)`

Extract UICP blocks without rendering.

```typescript
const { blocks, contentWithPlaceholders } = extractUICPBlocks(content);
```

### Component Management

#### `registerComponent(uid, component)`

Register a component in the registry.

```typescript
import { SimpleCard } from './components/simple-card';
registerComponent('SimpleCard', SimpleCard);
```

#### `loadComponent(uid, componentPath, basePath)`

Dynamically load a component.

```typescript
const component = await loadComponent(
  'SimpleCard',
  'components/uicp/simple-card',
  '/components/uicp'
);
```

#### `getComponent(uid)`

Get a registered component.

```typescript
const component = getComponent('SimpleCard');
```

#### `getRegisteredComponents()`

Get all registered component UIDs.

```typescript
const uids = getRegisteredComponents();
// ['SimpleCard', 'DataTable']
```

#### `clearRegistry(uid?)`

Clear registry (all or specific component).

```typescript
clearRegistry('SimpleCard'); // Clear specific
clearRegistry(); // Clear all
```

### Validation

#### `validateUICPBlock(block, definitions)`

Validate a block against definitions.

```typescript
const { valid, errors } = validateUICPBlock(block, definitions);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Definitions Loading

#### `loadDefinitions(source)`

Load definitions from URL, file path, or object.

```typescript
// From file
const defs = await loadDefinitions('./definitions.json');

// From URL
const defs = await loadDefinitions('https://api.example.com/definitions.json');

// From object
const defs = await loadDefinitions(definitionsObject);
```

#### `loadDefinitionsWithCache(source, ttl?)`

Load definitions with caching.

```typescript
const defs = await loadDefinitionsWithCache('./definitions.json', 5 * 60 * 1000);
```

**Parameters:**
- `source: string | Definitions` - Source to load from
- `ttl?: number` - Cache TTL in milliseconds (default: 5 minutes)

#### `clearDefinitionsCache(source?)`

Clear definitions cache.

```typescript
clearDefinitionsCache('./definitions.json'); // Clear specific
clearDefinitionsCache(); // Clear all
```

## TypeScript Types

```typescript
import type {
  UICPBlock,
  ParsedContent,
  ComponentDefinition,
  Definitions,
  ParserConfig,
  ValidationResult,
} from '@uicp/parser';
```

### Key Types

```typescript
interface UICPBlock {
  uid: string;
  data: Record<string, any>;
}

interface ParsedContent {
  type: 'text' | 'component';
  content: string | React.ReactElement;
  key: string;
}

interface ParserConfig {
  componentsBasePath?: string;
  definitions: string | Definitions;
}
```

## Usage Patterns

### With Next.js (Simplified)

**Step 1:** Create a registry file to pre-register your components:

```tsx
// lib/uicp/registry.ts
import { registerComponent } from '@uicp/parser';
import { SimpleCard } from '@/components/uicp/simple-card';
import { DataTable } from '@/components/uicp/data-table';

// Pre-register all UICP components
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);
```

**Step 2:** Use `UICPContent` in your message component:

```tsx
// components/message.tsx
'use client';

import { UICPContent } from '@uicp/parser';
import ReactMarkdown from 'react-markdown';
import definitions from '@/lib/uicp/definitions.json';
import '@/lib/uicp/registry'; // Import to register components

export function Message({ content }) {
  return (
    <UICPContent
      content={content}
      definitions={definitions}
      textRenderer={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
    />
  );
}
```

**That's it!** The `UICPContent` component handles everything: checking for UICP blocks, parsing, and rendering components or text as needed.

**Important for Next.js:** Pre-registering components ensures they're properly bundled by webpack. Dynamic imports at runtime don't work reliably in Next.js production builds.

### With Provider Pattern (For Multiple Messages)

```tsx
// app/layout.tsx or chat wrapper
import { UICPProvider } from '@uicp/parser';
import definitions from '@/lib/uicp/definitions.json';

export function ChatLayout({ children }) {
  return (
    <UICPProvider
      definitions={definitions}
      componentsBasePath="/components/uicp"
    >
      {children}
    </UICPProvider>
  );
}

// components/message.tsx - even simpler!
import { UICPContent } from '@uicp/parser';

export function Message({ content }) {
  return <UICPContent content={content} />;
}
```

### With Programmatic Parsing (Hook)

```tsx
import { useUICPParser } from '@uicp/parser';

export function Message({ content }) {
  const { parse, hasBlocks } = useUICPParser({
    definitions: '/lib/uicp/definitions.json',
    componentsBasePath: '/components/uicp',
  });
  
  const [parsed, setParsed] = useState([]);
  
  useEffect(() => {
    if (hasBlocks(content)) {
      parse(content).then(setParsed);
    }
  }, [content, parse, hasBlocks]);
  
  return (
    <div>
      {parsed.map((item) => 
        item.type === 'component' ? (
          <div key={item.key}>{item.content}</div>
        ) : (
          <Markdown key={item.key}>{item.content}</Markdown>
        )
      )}
    </div>
  );
}
```

### Advanced: Manual Registration

For maximum performance, pre-register components:

```typescript
import { registerComponent, parseUICPContentSync } from '@uicp/parser';
import { SimpleCard } from './components/simple-card';
import { DataTable } from './components/data-table';

// Register once at app startup
registerComponent('SimpleCard', SimpleCard);
registerComponent('DataTable', DataTable);

// Use sync parsing (no dynamic imports)
const parsed = parseUICPContentSync(content, definitions);
```

## Configuration

### Component Base Path

The default base path is `/components/uicp`. Override it:

```typescript
const parsed = await parseUICPContent(content, {
  definitions: './definitions.json',
  componentsBasePath: '/my-custom-path',
});
```

### Definitions File Structure

The `componentPath` in your definitions.json should be **relative to the `componentsBasePath`**:

```json
{
  "version": "1.0.0",
  "components": [
    {
      "uid": "SimpleCard",
      "componentPath": "simple-card",  // relative path, not "components/uicp/simple-card"
      ...
    }
  ]
}
```

If your component is at `/components/uicp/simple-card.tsx` and `componentsBasePath` is `/components/uicp`, then `componentPath` should be `"simple-card"`.

### Definitions Source

Support for multiple sources:

```typescript
// Local file
definitions: './definitions.json'

// URL
definitions: 'https://api.example.com/definitions.json'

// Object
definitions: definitionsObject
```

## Error Handling

The parser handles errors gracefully:

- **Invalid JSON**: Shows original block
- **Missing component**: Shows warning with component name
- **Validation errors**: Shows detailed error list
- **Loading errors**: Logs to console and shows warning

## Best Practices

1. **Pre-register components** in production for better performance
2. **Use caching** for definitions to reduce file reads/fetches
3. **Validate early** using `validateUICPBlock` before rendering
4. **Handle errors** by checking `hasUICPBlocks` first
5. **Type everything** using provided TypeScript types

## License

MIT - see [LICENSE](../../LICENSE) for details.

