import { existsSync, mkdirSync } from "node:fs";
import { traceState } from "./run-trace-state.mjs";

export function initRunTrace(opts = {}) {
  traceState.issueId = opts.issueId || process.env.ANQR_ISSUE_ID || null;
  traceState.runId = opts.runId || process.env.ANQR_RUN_ID || null;
  traceState.worktreeId = opts.worktreeId || process.env.ANQR_WORKTREE_ID || null;
  if (!traceState.issueId || !traceState.runId || !traceState.worktreeId) return;
  traceState.tracePath = `/tmp/anqr-runner-${traceState.worktreeId}-${traceState.issueId}-${traceState.runId}.log`;
  try {
    if (!existsSync("/tmp")) mkdirSync("/tmp", { recursive: true });
  } catch { /* /tmp always exists */ }
}
