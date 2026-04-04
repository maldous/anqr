import { REPAIRABLE_FINALIZATION_STATES } from "./repairable-finalization-states.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";

export function listRepairableIssuesForWorktree(worktreeId) {
  const store = loadState();
  const results = [];
  for (const [identifier, record] of Object.entries(store.issues)) {
    const normalized = normalizeRecord(record);
    if (
      normalized.finalization &&
      REPAIRABLE_FINALIZATION_STATES.has(normalized.finalization.state) &&
      normalized.finalization.stickyOwner === worktreeId
    ) {
      results.push({ issueIdentifier: identifier, finalization: normalized.finalization });
    }
  }
  return results;
}
