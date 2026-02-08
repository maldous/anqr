import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Use 'happy-dom' environment for unit tests - provides DOM APIs (document, Image, FileReader, canvas, etc.)
    environment: 'happy-dom',
    // Include unit test files
    include: ['tests/unit/**/*.spec.ts', 'tests/unit/**/*.test.ts'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'json-summary'],
      all: true,
      include: [
        'src/modules/**/*.ts',
        'src/lib/**/*.ts',
        'src/store/**/*.ts',
        'src/i18n/index.ts',
        'src/i18n/static/index.ts',
        'netlify/functions/**/*.ts',
      ],
      exclude: ['node_modules/**', 'tests/**', '**/*.d.ts', 'dist/**', 'coverage/**'],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
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
