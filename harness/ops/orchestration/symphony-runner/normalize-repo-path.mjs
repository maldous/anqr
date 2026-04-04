// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:221

export function normalizeRepoPath(value) {
  return String(value || "")
    .replace(/\\/g, "/")
    .trim();
}
