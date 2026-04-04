import { loadHealthState } from "./load-health-state.mjs";

export function getAllProviderHealthStates() {
  return loadHealthState();
}
