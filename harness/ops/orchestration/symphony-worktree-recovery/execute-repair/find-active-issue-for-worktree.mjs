import { loadState, leaseIsActive } from "../../../symphony-state.mjs";

export function findActiveIssueForWorktree(worktreeId) {
  const store = loadState();
  for (const [identifier, record] of Object.entries(store.issues || {})) {
    if (record?.assignment?.worktreeId !== worktreeId) continue;
    if (record?.lease && leaseIsActive({ lease: record.lease })) return identifier;
  }
  return null;
}
