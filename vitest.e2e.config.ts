import { defineConfig } from "vitest/config";
import { buildTsconfigAliases } from "./vite-config/build-tsconfig-aliases.ts";

const repoRoot = ".";
const tsconfigAliases = buildTsconfigAliases(repoRoot);

export default defineConfig({
  resolve: { alias: [...tsconfigAliases] },
  test: {
    globals: false,
    environment: "node",
    include: [
      "tests/e2e/linear-flow.spec.ts",
      "tests/e2e/discord-flow.spec.ts",
      "tests/e2e/integration-promotion.spec.ts",
      "tests/e2e/live-lifecycle-demo.spec.ts",
    ],
    exclude: ["node_modules", "dist"],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
  },
});
