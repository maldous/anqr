import { REQUIRED_LABEL_IDS } from "../../symphony-config.mjs";

export function issueNeedsLabelHygiene(issue) {
  const existing = new Set((issue.labels?.nodes || []).map((l) => l.id));
  return REQUIRED_LABEL_IDS.some((id) => !existing.has(id));
}
