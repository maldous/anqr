import { STALE_THRESHOLD_MS } from "../../symphony-config.mjs";

export function isStale(issue) {
  const updated = new Date(issue.updatedAt).getTime();
  return Date.now() - updated > STALE_THRESHOLD_MS;
}
