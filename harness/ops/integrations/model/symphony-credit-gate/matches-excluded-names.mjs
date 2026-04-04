// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1384

export function matchesExcludedNames(provider, excludedNames) {
  if (!excludedNames || excludedNames.size === 0) {
    return false;
  }
  return excludedNames.has(provider.name);
}
