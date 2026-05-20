// Per-run append-only trace file — one JSON line per event.
// Path: /tmp/anqr-runner-{WORKTREE_ID}-{ISSUE_ID}-{RUN_ID}.log
//
// Usage:
//   initRunTrace({ issueId, runId, worktreeId });   // call once per runner process
//   traceLog("START", "execution starting", { attempt: 1 });  // anytime after
//
// The file is written synchronously so it survives crashes without buffering loss.

import { appendFileSync, mkdirSync, existsSync } from "node:fs";

let tracePath = null;
let _issueId = null;
let _runId = null;
let _worktreeId = null;

export function initRunTrace(opts = {}) {
  _issueId = opts.issueId || process.env.ANQR_ISSUE_ID || null;
  _runId = opts.runId || process.env.ANQR_RUN_ID || null;
  _worktreeId = opts.worktreeId || process.env.ANQR_WORKTREE_ID || null;
  if (!_issueId || !_runId || !_worktreeId) return;
  tracePath = `/tmp/anqr-runner-${_worktreeId}-${_issueId}-${_runId}.log`;
  try {
    if (!existsSync("/tmp")) mkdirSync("/tmp", { recursive: true });
  } catch { /* /tmp always exists */ }
}

export function traceLog(category, msg, data = {}) {
  if (!tracePath) return;
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      issue: _issueId,
      run: _runId,
      wt: _worktreeId,
      cat: category,
      msg,
      ...data,
    }) + "\n";
    appendFileSync(tracePath, line);
  } catch { /* never throw from trace */ }
}

export function getTracePath() {
  return tracePath;
}
