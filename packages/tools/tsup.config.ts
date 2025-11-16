import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  // Mark Node.js built-ins as external to prevent bundling issues
  external: ['fs/promises', 'path', 'fs', 'node:fs/promises', 'node:path', 'node:fs'],
  // Ensure proper code splitting for dynamic imports
  treeshake: true,
  // Target both Node and browser environments
  platform: 'neutral',
});

