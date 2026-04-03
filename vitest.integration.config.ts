import { defineConfig } from "vitest/config";
import { buildTsconfigAliases } from "./vite-config/build-tsconfig-aliases.ts";

const repoRoot = ".";
const tsconfigAliases = buildTsconfigAliases(repoRoot);

export default defineConfig({
  resolve: { alias: [...tsconfigAliases] },
  test: {
    globals: false,
    environment: "node",
    include: ["tests/integration/**/*.spec.ts"],
    exclude: ["node_modules", "dist"],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 60_000,
  },
});
