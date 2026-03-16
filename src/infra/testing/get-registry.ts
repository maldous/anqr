import { REGISTRY_KEY } from "./registry-key";
import type { RegistryState } from "./registry.types";

export function getRegistry(): RegistryState {
  const bag = globalThis as Record<string, unknown>;
  if (!bag[REGISTRY_KEY]) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    } satisfies RegistryState;
  }
  return bag[REGISTRY_KEY] as RegistryState;
}
