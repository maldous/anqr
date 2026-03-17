export const FETCH_TIMEOUT_MS = Math.max(
  1000,
  Number.parseInt(process.env.ANQR_OVERLAY_FETCH_TIMEOUT_MS || "60000", 10),
);
