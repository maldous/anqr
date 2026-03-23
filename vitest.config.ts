import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: false,
    environment: "node",
    include: [
      "tests/unit/**/*.spec.ts",
      "tests/unit/**/*.test.ts",
      "tests/integration/**/*.spec.ts",
      "tests/integration/**/*.test.ts",
      "scripts/ops/**/*.spec.ts",
      "scripts/ops/**/*.test.ts",
      "packages/**/*.spec.ts",
      "packages/**/*.test.ts",
      "apps/**/*.spec.ts",
      "apps/**/*.test.ts",
    ],
    exclude: ["node_modules", "dist", "android", "ios", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}", "scripts/ops/**/*.{ts,mjs}"],
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "src/**/*.spec.ts", "**/*.generated.*"],
    },
    setupFiles: [],
    testTimeout: 30_000,
  },
});
