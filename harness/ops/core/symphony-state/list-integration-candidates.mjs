// Generated from ../../../scripts/ops/core/symphony-state.mjs:585

import { loadState } from "./load-state.mjs";

export function listIntegrationCandidates() {
  const store = loadState();
  return Array.isArray(store.global.integrationQueue) ? store.global.integrationQueue : [];
}
