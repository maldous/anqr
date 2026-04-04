// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:274

import { RAPID_RESTART_THRESHOLD } from "./rapid-restart-threshold.mjs";
import { RAPID_RESTART_WINDOW_MS } from "./rapid-restart-window-ms.mjs";
import { rapidRestartHistory } from "./rapid-restart-history.mjs";
import { logWarn } from "./logger.mjs";

export function detectRapidRestarts(serviceName) {
  const now = Date.now();
  const history = rapidRestartHistory.get(serviceName) || [];

  // Add current timestamp to history
  history.push(now);

  // Filter to only recent restarts within the window
  const recentRestarts = history.filter((ts) => now - ts < RAPID_RESTART_WINDOW_MS);

  rapidRestartHistory.set(serviceName, recentRestarts);

  // Check if threshold exceeded
  if (recentRestarts.length >= RAPID_RESTART_THRESHOLD) {
    logWarn(
      `[watchdog] 🚨 ${serviceName}: Detected ${recentRestarts.length} rapid restarts in ${RAPID_RESTART_WINDOW_MS / 1000}s - CATASTROPHIC FAILURE`,
    );
    return true;
  }

  return false;
}
