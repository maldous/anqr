import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Use 'node' environment for unit tests (not browser)
    environment: 'node',
    // Include unit test files
    include: ['tests/unit/**/*.spec.ts', 'tests/unit/**/*.test.ts'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/**', 'tests/**', '**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Mock import.meta.env for unit tests
  define: {
    'import.meta.env.DEV': JSON.stringify(false),
    'import.meta.env.PROD': JSON.stringify(true),
    'import.meta.env.MODE': JSON.stringify('test'),
  },
});
