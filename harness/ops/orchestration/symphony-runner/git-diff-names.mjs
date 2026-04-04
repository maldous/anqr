import { getWorkingTreeStatus } from "./get-working-tree-status.mjs";

export function gitDiffNames() {
  return [...new Set(getWorkingTreeStatus().blocked.map((entry) => entry.file))];
}
