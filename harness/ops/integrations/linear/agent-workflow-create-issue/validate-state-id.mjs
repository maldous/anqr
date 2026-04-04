// Generated from ../../../../scripts/ops/integrations/linear/agent-workflow-create-issue.mjs:80

import { AVAILABLE_STATES } from "./available-states.mjs";

export function validateStateId(stateId) {
  if (!AVAILABLE_STATES.includes(stateId)) {
    throw new Error(`Invalid stateId. Available states: ${AVAILABLE_STATES.join(", ")}`);
  }
  return stateId;
}
