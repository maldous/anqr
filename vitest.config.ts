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
  },
  test: {
    globals: false,
    environment: "jsdom",
    environmentMatchGlobs: [
      ["**/*.spec.tsx", "jsdom"],
      ["**/packages/ui/**/*.spec.ts", "jsdom"],
      ["**/packages/analytics/**/*.spec.tsx", "jsdom"],
      ["**/*.spec.ts", "node"],
      ["**/*.test.ts", "node"],
    ],
    include: [
      "tests/unit/**/*.spec.ts",
      "tests/unit/**/*.test.ts",
      "scripts/ops/**/*.spec.ts",
      "scripts/ops/**/*.test.ts",
      "packages/**/*.spec.ts",
      "packages/**/*.test.ts",
      "apps/**/*.spec.ts",
      "apps/**/*.test.ts",
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
        "**/*.test.ts",
        "**/*.spec.ts",
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
