import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { sanitizeModelSegment } from "./sanitize-model-segment.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";

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
  /translate/i,
  /translation/i,
  /orpheus/i,
  /reward/i,
  /judge/i,
  /evaluator/i,
  /prover/i,
  /reasoning-parser/i,
  /(?:^|[-_/])vl(?:$|[-_/])/i,
];

/**
 * Minimum parameter count (in billions) for a model to be considered capable
 * of real coding tasks. Models below this threshold produce false-positive
 * completions — they call task_complete without writing any code.
 *
 * 14B is the floor: below that, models lack the capacity for multi-file
 * code generation with correct syntax, imports, and conventions.
 */
const MIN_CODING_PARAMS_B = 14;

/**
 * Extract approximate parameter count from model name.
 * Matches patterns like "8b", "70b", "0.5b", "3.1-8b", "-14b-", etc.
 * Returns null if no parameter indicator is found.
 */
function extractParamCountB(model) {
  // Match parameter size indicators like "8b", "70b", "0.5b", "3b", "14b"
  const match = model.match(/(?:^|[-._/:])(\d+(?:\.\d+)?)[bB](?:[-._/:]|$)/);
  if (!match) return null;
  return parseFloat(match[1]);
}

export function buildDynamicCatalogProviders(staticProviders) {
  function hasConfiguredCredentials(provider) {
    if (provider?.driver === "codex-sdk") {
      return Boolean(process.env.OPENAI_API_KEY);
    }
    if (!provider?.envVar) {
      return typeof provider?.loadToken === "function" || true;
    }
    const value = process.env[provider.envVar];
    return Boolean((value && value !== "REPLACE" && value.length > 1) || provider?.loadToken);
  }

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
    // Reject models below minimum coding capability threshold.
    // Models with <14B params produce false-positive completions.
    const paramB = extractParamCountB(model);
    if (paramB !== null && paramB < MIN_CODING_PARAMS_B) return false;
    return true;
  }

  function sortCatalogRows(a, b) {
    const aSupport = a?.toolSupport === "supported" ? 1 : 0;
    const bSupport = b?.toolSupport === "supported" ? 1 : 0;
    const aContext = Number(a?.contextLength || 0);
    const bContext = Number(b?.contextLength || 0);
    return (
      bSupport - aSupport ||
      bContext - aContext ||
      String(a?.model || "").localeCompare(String(b?.model || ""))
    );
  }

  const cache = loadProviderCatalogCache();
  const dynamicProviders = [];
  for (const provider of staticProviders) {
    const key = provider?.catalogCacheKey;
    const rows = Array.isArray(cache?.[key]?.models) ? cache[key].models : [];
    if (!key || rows.length === 0) continue;
    if (!hasConfiguredCredentials(provider)) continue;

    const baseProbeEntry = getCachedProbeEntry(provider.name);
    if (shouldSkipProviderFromCache(baseProbeEntry, provider.name)) continue;

    const eligibleRows = rows.filter(isEligibleCatalogRow).sort(sortCatalogRows);

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
