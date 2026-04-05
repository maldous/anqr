import { getCachedOpenrouterModels } from "./get-cached-openrouter-models.mjs";

const cachedNames = getCachedOpenrouterModels().map((entry) => entry.providerName);

export const OPENROUTER_PROVIDER_NAMES = cachedNames.length > 0 ? cachedNames : ["openrouter-free"];
