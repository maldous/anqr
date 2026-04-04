export const CLOUD_API_BASE = String(
  process.env.CONTEXT7_API_BASE || "https://context7.com",
).replace(/\/+$/, "");

export const LEGACY_CLOUD_API_BASE = String(
  process.env.CONTEXT7_LEGACY_API_BASE || "https://api.context7.com",
).replace(/\/+$/, "");
