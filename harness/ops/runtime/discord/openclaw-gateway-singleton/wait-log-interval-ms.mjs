export const WAIT_LOG_INTERVAL_MS = Number.parseInt(
  process.env.OPENCLAW_WAIT_LOG_INTERVAL_MS || "60000",
  10,
);
