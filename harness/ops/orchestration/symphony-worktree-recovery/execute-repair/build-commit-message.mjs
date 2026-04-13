import { formatFileSummary } from "./format-file-summary.mjs";

export function buildCommitMessage(worktreeId, issueId, dirtyFiles) {
  const summary = formatFileSummary(dirtyFiles);
  if (issueId) return `fix(${issueId}): auto-commit ${worktreeId} — ${summary}`;
  return `chore: auto-commit ${worktreeId} — ${summary}`;
}
