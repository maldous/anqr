// Generated from ../../../../scripts/ops/integrations/model/symphony-adaptive-context.mjs:556

import { ERROR_TYPES } from "./error-types.mjs";
import { getOrCreateState } from "./get-or-create-state.mjs";

export function recordErrorType(providerName, errorType) {
  const state = getOrCreateState(providerName);
  if (errorType in state.errorCounts) {
    state.errorCounts[errorType]++;
  } else {
    state.errorCounts[ERROR_TYPES.UNKNOWN]++;
  }
}
