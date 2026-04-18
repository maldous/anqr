/** File name for in-flight request records. */
export const INFLIGHT_FILE_NAME = "inflight-requests.json";

/** TTL for in-flight request records — 10 minutes (2× typical request timeout). */
export const INFLIGHT_TTL_MS = 10 * 60 * 1000;
