import { getEnabledTimers } from "./get-enabled-timers.mjs";
import { getTimerStatus } from "./get-timer-status.mjs";
import { logInfo } from "./logger.mjs";

export function showStatus() {
  logInfo("📊 Linear Processing System Status\n");

  const timerStatus = getTimerStatus();
  if (timerStatus) {
    console.log(timerStatus);
  }

  const enabledServices = getEnabledTimers();
  logInfo(`\n🔧 Enabled services: ${enabledServices.length}`);
  if (enabledServices.length > 0) {
    logInfo("  Status: ✅ RUNNING - reconciler and executors active");
    for (const service of enabledServices) {
      logInfo(`  - ${service}`);
    }
  } else {
    logInfo("  Status: 🛑 STOPPED - no new tasks will be picked up");
  }
}
