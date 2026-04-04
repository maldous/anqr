// Generated from ../../../../scripts/ops/runtime/symphony/watchdog-monitor.mjs:69

import { checkBridgeHealth } from "./check-bridge-health.mjs";
import { log } from "./log.mjs";

export async function waitForBridge(port, name, timeoutMs) {
  const startTime = Date.now();
  const checkInterval = 2000; // Check every 2 seconds

  log(`⏳ Waiting for ${name} to become healthy (timeout: ${timeoutMs}ms)...`);

  while (Date.now() - startTime < timeoutMs) {
    const isHealthy = await checkBridgeHealth(port, name);
    if (isHealthy) {
      const elapsed = Date.now() - startTime;
      log(`✅ ${name} became healthy in ${elapsed}ms`);
      return true;
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  const elapsed = Date.now() - startTime;
  log(`❌ ${name} failed to become healthy within ${elapsed}ms`);
  return false;
}
