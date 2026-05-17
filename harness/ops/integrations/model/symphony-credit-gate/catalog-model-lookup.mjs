import { parseCatalogBody } from "./catalog-model-lookup/parse-catalog-body.mjs";
import { buildModelCandidates } from "./catalog-model-lookup/build-model-candidates.mjs";

export function catalogModelLookup(body, provider) {
  const parsed = parseCatalogBody(String(body || ""));
  const candidates = buildModelCandidates(provider);
  const matchedNeedle = candidates.find((candidate) => parsed.tokens.has(candidate)) || null;
  return {
    available: Boolean(matchedNeedle),
    matchedNeedle,
    parsedFormat: parsed.format,
  };
}
