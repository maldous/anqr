import { PROVIDERS } from "./providers.mjs";

export function getProviderDefinitions(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  return PROVIDERS.filter((p) => !excludeSet.has(p.name));
}
