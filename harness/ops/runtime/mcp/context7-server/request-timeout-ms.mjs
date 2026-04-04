export const REQUEST_TIMEOUT_MS = Number.parseInt(
  process.env.CONTEXT7_REQUEST_TIMEOUT_MS || "30000",
  10,
);
