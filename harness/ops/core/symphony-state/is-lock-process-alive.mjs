// Generated from ../../../scripts/ops/core/symphony-state.mjs:46

export function isLockProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
