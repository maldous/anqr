import { getEnabledTimers } from "./get-enabled-timers.mjs";
import { getTimerStatus } from "./get-timer-status.mjs";
import { logInfo } from "./logger.mjs";

export function showStatus() {
  logInfo("📊 Linear Runner System Status\n");

  const timerStatus = getTimerStatus();
  if (timerStatus) {
    console.log(timerStatus);
  }

  const enabledTimers = getEnabledTimers();
  logInfo(`\n🔧 Enabled timers: ${enabledTimers.length}`);
  if (enabledTimers.length > 0) {
    logInfo("  Status: ✅ RUNNING - new tasks will be picked up");
    for (const timer of enabledTimers) {
      logInfo(`  - ${timer}`);
    }
  } else {
    logInfo("  Status: 🛑 STOPPED - no new tasks will be picked up");
  }
}
