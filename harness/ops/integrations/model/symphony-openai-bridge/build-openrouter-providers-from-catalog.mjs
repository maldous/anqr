import { getCachedOpenrouterModels } from "./get-cached-openrouter-models.mjs";
import { sortModels } from "./build-openrouter-providers-from-catalog/sort-models.mjs";

const EXCLUDED_MODEL_PATTERNS = [
  /whisper/i,
  /audio/i,
  /speech/i,
  /tts/i,
  /vision/i,
  /image/i,
  /ocr/i,
  /translate/i,
  /translation/i,
  /embed/i,
  /embedding/i,
  /rerank/i,
  /reward/i,
  /judge/i,
  /evaluator/i,
  /prover/i,
  /(?:^|[-_/])vl(?:$|[-_/])/i,
];

export function buildOpenrouterProvidersFromCatalog() {
  if (!process.env.OPENROUTER_TOKEN) {
    return [];
  }

  return getCachedOpenrouterModels()
    .filter((entry) => entry?.providerName && entry?.model)
    .filter(
      (entry) => !EXCLUDED_MODEL_PATTERNS.some((pattern) => pattern.test(String(entry.model))),
    )
    .sort(sortModels)
    .map((entry) => ({
      name: entry.providerName,
      model: entry.model,
      baseProviderName: "openrouter",
      baseUrl: "https://openrouter.ai/api/v1",
      envVar: "OPENROUTER_TOKEN",
      dynamic: true,
      contextLength: entry.contextLength,
      supportedParameters: entry.supportedParameters,
      catalogToolSupport: "supported",
      catalogToolSupportReason: `supported_parameters=${(entry.supportedParameters || []).join(",")}`,
    }));
}
