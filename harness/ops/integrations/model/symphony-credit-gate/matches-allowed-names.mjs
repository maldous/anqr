// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1377

export function matchesAllowedNames(provider, allowedNames) {
  if (!allowedNames || allowedNames.size === 0) {
    return true;
  }
  return allowedNames.has(provider.name);
}
