// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:534

import { join, resolve } from "node:path";
import { readdir } from "node:fs/promises";

import { DEFAULT_OPTIONS } from "./default-options.mjs";
import { isSupportedFile } from "./is-supported-file.mjs";
import { normalizeExtensions } from "./normalize-extensions.mjs";
import { logWarn } from "./logger.mjs";

export async function collectFiles(dirPath, extensions = DEFAULT_OPTIONS.extensions) {
  const supported = normalizeExtensions(extensions);
  const files = [];
  const stack = [resolve(dirPath)];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    let entries;

    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      logWarn(`Failed to read directory ${currentDir}: ${err.message}`);
      continue;
    }

    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && isSupportedFile(entry.name, supported)) {
        files.push(fullPath);
      }
    }
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}
