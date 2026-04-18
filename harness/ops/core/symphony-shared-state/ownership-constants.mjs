/** File name for durable active-job ownership records. */
export const OWNERSHIP_FILE_NAME = "active-job-ownership.json";

/** TTL for ownership records — 5 minutes (matches typical request timeout). */
export const OWNERSHIP_TTL_MS = 5 * 60 * 1000;
