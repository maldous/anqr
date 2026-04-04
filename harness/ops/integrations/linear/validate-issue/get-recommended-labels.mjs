// Generated from ../../../../scripts/ops/integrations/linear/validate-issue.mjs:271

import { LABELS } from "../linear-client.mjs";

export function getRecommendedLabels(currentLabels) {
  const recommendations = [];

  // If no labels, recommend harness as default
  if (!currentLabels || currentLabels.length === 0) {
    recommendations.push(LABELS.harness);
  }

  // If only harness, consider adding secondary label
  if (currentLabels.includes(LABELS.harness) && currentLabels.length === 1) {
    recommendations.push(LABELS.hygiene); // Common combination
  }

  return [...new Set([...(currentLabels || []), ...recommendations])];
}
