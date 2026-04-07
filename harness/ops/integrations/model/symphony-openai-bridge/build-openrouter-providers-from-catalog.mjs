import { getCachedOpenrouterModels } from "./get-cached-openrouter-models.mjs";

const MAX_OPENROUTER_MODELS = Number.parseInt(
  process.env.SYMPHONY_MAX_OPENROUTER_MODELS || "24",
  10,
);
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
  function sortModels(a, b) {
    const aTools = Array.isArray(a?.supportedParameters) ? a.supportedParameters.length : 0;
    const bTools = Array.isArray(b?.supportedParameters) ? b.supportedParameters.length : 0;
    const aContext = Number(a?.contextLength || 0);
    const bContext = Number(b?.contextLength || 0);
    return (
      bTools - aTools ||
      bContext - aContext ||
      String(a?.model || "").localeCompare(String(b?.model || ""))
    );
  }

  if (!process.env.OPENROUTER_TOKEN) {
    return [];
  }

  return getCachedOpenrouterModels()
    .filter((entry) => entry?.providerName && entry?.model)
    .filter(
      (entry) => !EXCLUDED_MODEL_PATTERNS.some((pattern) => pattern.test(String(entry.model))),
    )
    .sort(sortModels)
    .slice(0, Number.isFinite(MAX_OPENROUTER_MODELS) ? MAX_OPENROUTER_MODELS : 24)
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
