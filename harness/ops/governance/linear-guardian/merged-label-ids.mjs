// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:142

import { REQUIRED_LABEL_IDS } from "../../symphony-config.mjs";

export function mergedLabelIds(issue) {
  const existing = (issue.labels?.nodes || []).map((l) => l.id);
  const merged = new Set([...existing, ...REQUIRED_LABEL_IDS]);
  return [...merged];
}
