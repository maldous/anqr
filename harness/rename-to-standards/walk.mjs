import fs from "node:fs";
import path from "node:path";

import { isCodeFile } from "./is-code-file.mjs";
import { shouldSkip } from "./should-skip.mjs";

export const walk = (dirPath, results = []) => {
  if (!fs.existsSync(dirPath)) return results;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (shouldSkip(fullPath)) continue;
    if (entry.isDirectory()) {
      walk(fullPath, results);
      continue;
    }
    if (entry.isFile() && isCodeFile(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
};
