import { resolve, dirname } from "node:path";

// Use the main repo root (computed from this module's location) instead of process.cwd()
// This ensures worktrees write to the shared /home/user/src/anqr/reports/symphony/ directory
export const PROJECT_ROOT = resolve(
  dirname(new URL(import.meta.url).pathname),
  "..",
  "..",
  "..",
  "..",
  "..",
);
