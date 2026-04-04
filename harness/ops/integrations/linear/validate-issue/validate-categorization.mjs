// Generated from ../../../../scripts/ops/integrations/linear/validate-issue.mjs:239

import { LABELS } from "../linear-client.mjs";

import { getRecommendedLabels } from "./get-recommended-labels.mjs";

export function validateCategorization(labelIds) {
  const validCombinations = [
    [LABELS.harness],
    [LABELS.governance],
    [LABELS.hygiene],
    [LABELS.product],
    [LABELS.release],
    [LABELS.growth],
    [LABELS.incident],
    [LABELS.research],
    [LABELS.harness, LABELS.hygiene],
    [LABELS.harness, LABELS.discord],
    [LABELS.product, LABELS.release],
    [LABELS.harness, LABELS.product],
  ];

  const isValid = validCombinations.some((combo) =>
    combo.every((label) => labelIds.includes(label)),
  );

  return {
    valid: isValid,
    validCombinations,
    recommendedLabels: getRecommendedLabels(labelIds),
  };
}
