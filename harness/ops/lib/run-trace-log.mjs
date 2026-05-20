import { appendFileSync } from "node:fs";
import { traceState } from "./run-trace-state.mjs";

export function traceLog(category, msg, data = {}) {
  if (!traceState.tracePath) return;
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      issue: traceState.issueId,
      run: traceState.runId,
      wt: traceState.worktreeId,
      cat: category,
      msg,
      ...data,
    }) + "\n";
    appendFileSync(traceState.tracePath, line);
  } catch { /* never throw from trace */ }
}
