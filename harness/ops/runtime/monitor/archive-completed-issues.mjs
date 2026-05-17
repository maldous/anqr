#!/usr/bin/env node
/**
 * archive-completed-issues.mjs
 *
 * Removes issues from the symphony state file that have been successfully
 * integrated to main and are older than ARCHIVE_AFTER_MINUTES (default 60).
 *
 * Uses the symphony state module's mutateState for safe atomic writes
 * with proper file locking.
 *
 * Install:
 *   systemctl --user enable --now anqr-archive-completed.timer
 *
 * Check:
 *   journalctl --user -u anqr-archive-completed.service --since today
 */

import { mutateState } from "../../core/symphony-state/mutate-state.mjs";

const ARCHIVE_AFTER_MINUTES = Number(process.env.ANQR_ARCHIVE_AFTER_MINUTES || 60);
const ARCHIVE_AFTER_MS = ARCHIVE_AFTER_MINUTES * 60 * 1000;
const now = Date.now();

let archived = 0;

mutateState((store) => {
  const issues = store.issues || {};
  for (const [id, record] of Object.entries(issues)) {
    const fin = record.finalization;
    if (fin?.state !== "integrated_main") continue;

    const updatedAt = fin.updatedAt ? new Date(fin.updatedAt).getTime() : 0;
    if (now - updatedAt > ARCHIVE_AFTER_MS) {
      delete issues[id];
      archived++;
      console.log(`Archived ${id} (updated ${fin.updatedAt})`);
    }
  }
});

console.log(`Done. Archived ${archived} issue(s) older than ${ARCHIVE_AFTER_MINUTES} minutes.`);
process.exit(0);
