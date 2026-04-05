import { getCachedOpenrouterModels } from "./get-cached-openrouter-models.mjs";

export function getCachedContextWindowByProviderName(providerName) {
  const match = getCachedOpenrouterModels().find((entry) => entry.providerName === providerName);
  return match?.contextLength || null;
}
