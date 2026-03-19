const REGISTRY_KEY = "__ANQR_DYNAMIC_TESTID_REGISTRY__";

export function getRegistry(): {
  usedBySource: Map<string, string>;
  countsByBase: Map<string, number>;
} {
  const bag = globalThis as Record<string, unknown>;
  if (!(REGISTRY_KEY in bag)) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    };
  }
  return bag[REGISTRY_KEY] as {
    usedBySource: Map<string, string>;
    countsByBase: Map<string, number>;
  };
}
