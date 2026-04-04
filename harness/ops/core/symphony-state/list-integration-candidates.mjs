import { loadState } from "./load-state.mjs";

export function listIntegrationCandidates() {
  const store = loadState();
  return Array.isArray(store.global.integrationQueue) ? store.global.integrationQueue : [];
}
