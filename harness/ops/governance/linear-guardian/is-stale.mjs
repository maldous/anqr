// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:132

import { STALE_THRESHOLD_MS } from "../../symphony-config.mjs";

export function isStale(issue) {
  const updated = new Date(issue.updatedAt).getTime();
  return Date.now() - updated > STALE_THRESHOLD_MS;
}
