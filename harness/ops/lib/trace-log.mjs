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
