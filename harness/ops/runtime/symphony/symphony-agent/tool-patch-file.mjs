// Generated from ../../../../scripts/ops/runtime/symphony/symphony-agent.mjs:298

import { readFileSync, writeFileSync, existsSync } from "node:fs";

import { validatePath } from "./validate-path.mjs";

export function toolPatchFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  if (!existsSync(fullPath)) {
    return `Error: File not found: ${args.path}`;
  }
  const content = readFileSync(fullPath, "utf-8");
  const idx = content.indexOf(args.search);
  if (idx === -1) {
    return `Error: Search string not found in ${args.path}. Ensure the search string is an exact match including whitespace.`;
  }
  const patched = content.slice(0, idx) + args.replace + content.slice(idx + args.search.length);
  writeFileSync(fullPath, patched, "utf-8");
  return `Patched: ${args.path} (replaced ${args.search.length} chars at offset ${idx})`;
}
