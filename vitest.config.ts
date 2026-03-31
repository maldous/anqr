import path from "node:path";
import { defineConfig } from "vitest/config";
import { buildTsconfigAliases } from "./vite-config/build-tsconfig-aliases.ts";

const repoRoot = import.meta.dirname;
const tsconfigAliases = buildTsconfigAliases(repoRoot);

export default defineConfig({
  resolve: {
    alias: [
      ...tsconfigAliases,
      {
        find: "@",
        replacement: path.resolve(repoRoot, "src"),
      },
    ],
    // Allow importing .mjs files from scripts directory
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
  },
  test: {
    globals: false,
    environment: "jsdom",
    // @ts-expect-error - environmentMatchGlobs is valid in vitest but not in types
    environmentMatchGlobs: [
      ["**/*.spec.tsx", "jsdom"],
      ["**/packages/ui/**/*.spec.ts", "jsdom"],
      ["**/packages/analytics/**/*.spec.tsx", "jsdom"],
      ["**/*.spec.ts", "node"],
      ["**/*.test.ts", "node"],
    ],
    include: [
      "tests/unit/**/*.spec.{ts,tsx}",
      "tests/unit/**/*.test.{ts,tsx}",
      "scripts/ops/**/*.spec.{ts,tsx}",
      "scripts/ops/**/*.test.{ts,tsx}",
      "packages/**/*.spec.{ts,tsx}",
      "packages/**/*.test.{ts,tsx}",
      "apps/**/*.spec.{ts,tsx}",
      "apps/**/*.test.{ts,tsx}",
    ],
    exclude: ["node_modules", "dist", "android", "ios", "tests/e2e/**", "tests/integration/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      skipFull: false,
      clean: true,
      cleanOnRerun: true,
      include: ["packages/**/*.{ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.generated.*",
        "**/index.ts",
        "**/__mocks__/**",
        "**/node_modules/**",
      ],
    },
    setupFiles: [],
    testTimeout: 30_000,
  },
});
