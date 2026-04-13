import fs from "node:fs";
import path from "node:path";

import { WORKTREE_ID } from "../worktree-id.mjs";
import { logError } from "../logger.mjs";

export function writeEvidenceRecord(serviceName, shortName, reason, commit) {
  const evidenceDir = path.join(process.env.XDG_RUNTIME_DIR || "/tmp", "anqr-watchdog-evidence");
  try {
    fs.mkdirSync(evidenceDir, { recursive: true });
  } catch {
    /* ok */
  }
  const record = {
    timestamp: new Date().toISOString(),
    service: serviceName,
    shortName,
    reason,
    commit,
    worktreeId: WORKTREE_ID,
    action: "quarantine-and-restart",
    pid: process.pid,
  };
  const filename = `${Date.now()}-${shortName}.json`;
  try {
    fs.writeFileSync(path.join(evidenceDir, filename), JSON.stringify(record, null, 2) + "\n");
  } catch (err) {
    logError(`[watchdog] Failed to write evidence record: ${err.message}`);
  }
  return record;
}
