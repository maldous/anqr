import { MAX_CONCURRENT_AGENTS } from "../../symphony-config.mjs";

import { countEnabledTimers } from "./count-enabled-timers.mjs";
import { logAction } from "./log-action.mjs";

export function validateConcurrencyConfig() {
  const enabledTimers = countEnabledTimers();
  if (enabledTimers === 0) {
    // No timers enabled - probably running manually or not using systemd
    return;
  }
  if (enabledTimers > MAX_CONCURRENT_AGENTS) {
    logAction(
      "info",
      `⚠️  WARNING: ${enabledTimers} executor services enabled but MAX_CONCURRENT_AGENTS=${MAX_CONCURRENT_AGENTS}`,
    );
    logAction(
      "info",
      `⚠️  ${enabledTimers - MAX_CONCURRENT_AGENTS} executor slot(s) may starve. Update MAX_CONCURRENT_AGENTS in symphony-config.mjs`,
    );
  } else if (enabledTimers < MAX_CONCURRENT_AGENTS) {
    logAction(
      "info",
      `ℹ️  ${enabledTimers} executor services enabled, MAX_CONCURRENT_AGENTS=${MAX_CONCURRENT_AGENTS} (${MAX_CONCURRENT_AGENTS - enabledTimers} unused slot(s))`,
    );
  }
}
