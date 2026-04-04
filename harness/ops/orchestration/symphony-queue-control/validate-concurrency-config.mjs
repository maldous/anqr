// Generated from ../../../scripts/ops/orchestration/symphony-queue-control.mjs:97

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
      `⚠️  WARNING: ${enabledTimers} timers enabled but MAX_CONCURRENT_AGENTS=${MAX_CONCURRENT_AGENTS}`,
    );
    logAction(
      "info",
      `⚠️  ${enabledTimers - MAX_CONCURRENT_AGENTS} runner(s) may starve. Update MAX_CONCURRENT_AGENTS in symphony-config.mjs`,
    );
  } else if (enabledTimers < MAX_CONCURRENT_AGENTS) {
    logAction(
      "info",
      `ℹ️  ${enabledTimers} timers enabled, MAX_CONCURRENT_AGENTS=${MAX_CONCURRENT_AGENTS} (${MAX_CONCURRENT_AGENTS - enabledTimers} unused slot(s))`,
    );
  }
}
