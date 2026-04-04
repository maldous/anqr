import { dirname } from "node:path";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";

import { validatePath } from "./validate-path.mjs";

export function toolWriteFile(projectRoot, args) {
  const fullPath = validatePath(projectRoot, args.path);
  const dir = dirname(fullPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(fullPath, args.content, "utf-8");
  return `Written: ${args.path} (${args.content.length} chars)`;
}
