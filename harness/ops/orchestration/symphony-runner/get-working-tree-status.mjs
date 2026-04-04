import { getWorkingTreeEntries } from "./get-working-tree-entries.mjs";

export function getWorkingTreeStatus() {
  const entries = getWorkingTreeEntries();
  return {
    entries,
    allowed: entries.filter((entry) => entry.allowed),
    blocked: entries.filter((entry) => !entry.allowed),
  };
}
