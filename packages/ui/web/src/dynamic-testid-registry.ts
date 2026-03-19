import type { Registry } from "./dynamic-testid-registry.types";

const REGISTRY_KEY = "__ANQR_DYNAMIC_TESTID_REGISTRY__";

export function getRegistry(): Registry {
  const bag = globalThis as Record<string, unknown>;
  if (!(REGISTRY_KEY in bag)) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    } satisfies Registry;
  }
  return bag[REGISTRY_KEY] as Registry;
}
