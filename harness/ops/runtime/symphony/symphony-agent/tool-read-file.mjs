// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:228

import { readFileSync, existsSync, statSync } from "node:fs";

import { validatePath } from "./validate-path.mjs";

export function toolReadFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (stat.isDirectory()) {
    return `Error: ${args.path} is a directory, not a file. Use list_directory instead.`;
  }
  if (stat.size > 100_000) {
    return `Error: File too large (${stat.size} bytes). Use run_command with head/tail for partial reads.`;
  }
  return readFileSync(fullPath, "utf-8");
}
