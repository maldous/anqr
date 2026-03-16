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
    environment: "happy-dom",
    include: ["tests/unit/**/*.spec.ts", "tests/unit/**/*.test.ts"],
    exclude: ["node_modules", "dist", "android", "ios"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.{ts,tsx}", "packages/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/**/*.test.ts", "src/**/*.spec.ts", "**/*.generated.*"],
    },
    setupFiles: [],
    testTimeout: 10_000,
  },
});
