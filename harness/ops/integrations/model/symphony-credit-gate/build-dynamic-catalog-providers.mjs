import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { sanitizeModelSegment } from "./sanitize-model-segment.mjs";

const MAX_DYNAMIC_MODELS_PER_PROVIDER = 24;
const EXCLUDED_MODEL_PATTERNS = [
  /whisper/i,
  /transcrib/i,
  /tts/i,
  /speech/i,
  /audio/i,
  /moderat/i,
  /guard/i,
  /embed/i,
  /embedding/i,
  /rerank/i,
  /re-rank/i,
  /ocr/i,
  /vision/i,
  /image/i,
  /\bvl\b/i,
];

function supportsTextIO(raw) {
  const inputModalities = Array.isArray(raw?.architecture?.input_modalities)
    ? raw.architecture.input_modalities
    : Array.isArray(raw?.input_modalities)
      ? raw.input_modalities
      : [];
  const outputModalities = Array.isArray(raw?.architecture?.output_modalities)
    ? raw.architecture.output_modalities
    : Array.isArray(raw?.output_modalities)
      ? raw.output_modalities
      : [];
  const acceptsText = inputModalities.length === 0 || inputModalities.includes("text");
  const outputsText = outputModalities.length === 0 || outputModalities.includes("text");
  return acceptsText && outputsText;
}

function isEligibleCatalogRow(row) {
  const model = String(row?.model || row?.id || "").trim();
  if (!model) return false;
  if (EXCLUDED_MODEL_PATTERNS.some((pattern) => pattern.test(model))) return false;
  if (!supportsTextIO(row?.raw || row)) return false;
  if (row?.toolSupport === "unsupported") return false;
  return true;
}

function sortCatalogRows(a, b) {
  const aSupport = a?.toolSupport === "supported" ? 1 : 0;
  const bSupport = b?.toolSupport === "supported" ? 1 : 0;
  const aContext = Number(a?.contextLength || 0);
  const bContext = Number(b?.contextLength || 0);
  return bSupport - aSupport || bContext - aContext || String(a?.model || "").localeCompare(String(b?.model || ""));
}

export function buildDynamicCatalogProviders(staticProviders) {
  const cache = loadProviderCatalogCache();
  const dynamicProviders = [];
  for (const provider of staticProviders) {
    const key = provider?.catalogCacheKey;
    const rows = Array.isArray(cache?.[key]?.models) ? cache[key].models : [];
    if (!key || rows.length === 0) continue;
    const eligibleRows = rows.filter(isEligibleCatalogRow).sort(sortCatalogRows).slice(0, MAX_DYNAMIC_MODELS_PER_PROVIDER);
    for (const row of eligibleRows) {
      const model = row?.model || row?.id;
      if (!model) continue;
      dynamicProviders.push({
        ...provider,
        name: `${provider.name}-${sanitizeModelSegment(model)}`,
        baseProviderName: provider.name,
        model,
        dynamic: true,
        contextLength: row?.contextLength || provider.contextLength || null,
        supportedParameters: Array.isArray(row?.supportedParameters)
          ? row.supportedParameters
          : Array.isArray(provider?.supportedParameters)
            ? provider.supportedParameters
            : [],
        catalogToolSupport: row?.toolSupport || "unknown",
        catalogToolSupportReason: row?.toolSupportReason || "catalog has no explicit tool metadata",
        capabilities: row?.raw?.capabilities || provider?.capabilities || {},
      });
    }
  }
  return dynamicProviders;
}
