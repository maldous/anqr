import { PROVIDERS } from "./providers.mjs";

export function findProviderByName(name) {
  return PROVIDERS.find((provider) => provider.name === name) || null;
}
