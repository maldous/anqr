// Generated from ../../../../scripts/ops/integrations/linear/agent-workflow-create-issue.mjs:88

import { LABELS } from "../linear-client.mjs";

import { AVAILABLE_LABELS } from "./available-labels.mjs";

export function parseLabels(labelString) {
  if (!labelString) return [];

  const labelNames = labelString.split(",").map((l) => l.trim());
  const invalidLabels = labelNames.filter((name) => !AVAILABLE_LABELS.includes(name));

  if (invalidLabels.length > 0) {
    throw new Error(
      `Invalid labels: ${invalidLabels.join(", ")}. Available labels: ${AVAILABLE_LABELS.join(", ")}`,
    );
  }

  return labelNames.map((name) => LABELS[name]);
}
