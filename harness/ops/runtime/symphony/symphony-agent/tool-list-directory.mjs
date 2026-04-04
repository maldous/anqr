// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:339

import { existsSync, readdirSync, statSync } from "node:fs";

import { validatePath } from "./validate-path.mjs";

export function toolListDirectory(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path || ".");
  if (!existsSync(fullPath)) {
    return `Error: Directory not found: ${args.path}`;
  }
  const stat = statSync(fullPath);
  if (!stat.isDirectory()) {
    return `Error: ${args.path} is a file, not a directory. Use read_file instead.`;
  }
  const entries = readdirSync(fullPath, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name + "/");
  const files = entries.filter((e) => e.isFile()).map((e) => e.name);
  return [...dirs.sort(), ...files.sort()].join("\n") || "(empty directory)";
}
