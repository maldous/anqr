import { loadHealthState } from "./load-health-state.mjs";
import { saveHealthState } from "./save-health-state.mjs";
import { logInfo } from "./logger.mjs";

export function setProviderHealthState(providerName, healthState, metadata = {}) {
  const state = loadHealthState();
  state[providerName] = {
    state: healthState,
    lastUpdated: Date.now(),
    ...metadata,
  };
  saveHealthState(state);
  logInfo(`Provider health: ${providerName} → ${healthState}`);
}
