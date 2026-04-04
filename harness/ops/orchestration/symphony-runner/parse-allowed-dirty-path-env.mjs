// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:227

import { normalizeRepoPath } from "./normalize-repo-path.mjs";

export function parseAllowedDirtyPathEnv() {
  return String(process.env.ANQR_RUNNER_ALLOWED_DIRTY_PATHS || "")
    .split(",")
    .map((item) => normalizeRepoPath(item))
    .filter(Boolean);
}
