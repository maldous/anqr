import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export function hasConflictMarkers(worktreePath, dirtyFiles) {
  for (const entry of dirtyFiles.slice(0, 10)) {
    const filePath = entry.slice(3).trim();
    if (filePath.includes(" -> ")) continue;
    try {
      const fullPath = resolve(worktreePath, filePath);
      if (!existsSync(fullPath)) continue;
      const content = readFileSync(fullPath, "utf-8").slice(0, 10_000);
      if (/<<<<<<<[\s\S]*>>>>>>>/.test(content)) {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}
