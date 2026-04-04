import { providerStates } from "./provider-states.mjs";

export function getProviderAdaptiveState(providerName) {
  if (!providerStates.has(providerName)) return null;
  return providerStates.get(providerName);
}
