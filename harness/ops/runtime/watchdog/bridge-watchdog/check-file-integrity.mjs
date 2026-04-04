// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:196

import path from "node:path";
import { readFile, stat } from "node:fs/promises";

export async function checkFileIntegrity(service) {
  const issues = [];
  const cwd = process.cwd();

  for (const filePath of service.criticalFiles || []) {
    try {
      const fullPath = path.join(cwd, filePath);
      const stats = await stat(fullPath);

      // Check for obviously truncated files (< 100 bytes is suspicious for module files)
      if (stats.size < 100) {
        issues.push(`${filePath} is suspiciously small (${stats.size} bytes)`);
      }

      // Read first few lines to check for obvious corruption
      const content = await readFile(fullPath, "utf-8");
      const firstLine = content.split("\n")[0] || "";

      // If file starts with just a comment, it's likely truncated
      if (firstLine.startsWith("//") && content.split("\n").length < 5) {
        issues.push(`${filePath} appears truncated (only ${content.split("\n").length} lines)`);
      }
    } catch (err) {
      issues.push(`${filePath} not found or unreadable: ${err.message}`);
    }
  }

  return issues;
}
