// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:213

import { readLockInfo } from "./read-lock-info.mjs";

export async function isLockStillOurs() {
  const info = await readLockInfo();
  return info && info.runnerPid === process.pid;
}
