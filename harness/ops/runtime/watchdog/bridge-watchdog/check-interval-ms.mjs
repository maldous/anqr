// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:26

export const CHECK_INTERVAL_MS =
  (Number.parseInt(process.env.WATCHDOG_CHECK_INTERVAL) || 30) * 1000;
