// Generated from ../scripts/agent-docs-check.mjs:11

import path from "node:path";

import { repoRoot } from "./repo-root.mjs";

export function resolve(rel) {
  return path.join(repoRoot, rel);
}
