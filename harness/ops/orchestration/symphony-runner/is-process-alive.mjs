// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:316

export function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
