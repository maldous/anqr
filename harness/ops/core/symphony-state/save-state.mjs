import fs from "node:fs";

import { ensureDir } from "./ensure-dir.mjs";
import { getStateFile } from "./get-state-file.mjs";

export function saveState(store) {
  ensureDir();
  const stateFile = getStateFile();
  store.updatedAt = new Date().toISOString();

  // Guard: refuse to overwrite non-empty issues with an empty set.
  // This prevents a stale in-memory snapshot from wiping active leases.
  const issueCount = Object.keys(store.issues || {}).length;
  if (issueCount === 0) {
    try {
      const disk = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
      const diskIssueCount = Object.keys(disk.issues || {}).length;
      if (diskIssueCount > 0) {
        const stack = new Error("saveState:empty-wipe").stack.split("\n").slice(1, 5).join(" | ");
        process.stderr.write(
          `[save-state] REFUSED: saving issues={} would wipe ${diskIssueCount} active issue(s) on disk (pid=${process.pid}) caller: ${stack}\n`,
        );
        return; // abort the write — caller's in-memory snapshot is stale
      }
    } catch {
      // ENOENT or parse error: disk has no state, empty write is fine
    }
    const stack = new Error("saveState:empty-issues").stack.split("\n").slice(1, 5).join(" | ");
    process.stderr.write(`[save-state] WARN: saving empty issues (pid=${process.pid}) caller: ${stack}\n`);
  }

  // Atomic write: temp file + rename prevents partial/corrupt state on crash or concurrent access
  const tmpFile = `${stateFile}.tmp.${process.pid}`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2) + "\n");
  fs.renameSync(tmpFile, stateFile);
}
