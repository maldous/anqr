export const RESTART_BACKOFF_MS = Number.parseInt(
  process.env.OPENCLAW_RESTART_BACKOFF_MS || "15000",
  10,
);
