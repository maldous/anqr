export const CHECK_INTERVAL_MS =
  (Number.parseInt(process.env.WATCHDOG_CHECK_INTERVAL) || 30) * 1000;
