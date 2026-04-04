// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:306

import { ensureLockDir } from "./ensure-lock-dir.mjs";
import { followerLoop } from "./follower-loop.mjs";
import { logInfo } from "./log-info.mjs";
import { releaseLock } from "./release-lock.mjs";

export async function main() {
  await ensureLockDir();
  await followerLoop();
  await releaseLock();
  logInfo("Gateway singleton exit complete");
}
