export const PORT_CHECK_INTERVAL_MS = Number.parseInt(
  process.env.OPENCLAW_PORT_CHECK_INTERVAL_MS || "30000",
  10,
);
