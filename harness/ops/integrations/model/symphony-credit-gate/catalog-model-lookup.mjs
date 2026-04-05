export function catalogModelLookup(body, provider) {
  function parseCatalogBody(text) {
    try {
      return parseJsonCatalog(JSON.parse(text));
    } catch {
      return {
        format: "text",
        tokens: new Set(
          String(text || "")
            .toLowerCase()
            .split(/[^a-z0-9._:/-]+/i)
            .filter(Boolean),
        ),
      };
    }
  }

  function parseJsonCatalog(value) {
    const tokens = new Set();
    collectTokens(value, tokens);
    return { format: "json", tokens };
  }

  function collectTokens(value, tokens) {
    if (!value) return;
    if (Array.isArray(value)) {
      for (const entry of value) collectTokens(entry, tokens);
      return;
    }
    if (typeof value === "object") {
      for (const [key, entry] of Object.entries(value)) {
        if (
          ["id", "model", "name", "slug", "canonical_slug", "hugging_face_id"].includes(key) &&
          typeof entry === "string"
        ) {
          tokens.add(entry.toLowerCase());
        }
        collectTokens(entry, tokens);
      }
      return;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized) tokens.add(normalized);
    }
  }

  function buildModelCandidates(entry) {
    const model = String(entry?.model || "")
      .trim()
      .toLowerCase();
    const candidates = new Set([model]);
    if (model.includes(":free")) candidates.add(model.replace(/:free$/i, ""));
    if (entry?.name === "github-models") candidates.add(`openai/${model}`);
    if (entry?.name === "sambanova") candidates.add(model.replace(/-/g, " "));
    return [...candidates].filter(Boolean);
  }

  const parsed = parseCatalogBody(String(body || ""));
  const candidates = buildModelCandidates(provider);
  const matchedNeedle = candidates.find((candidate) => parsed.tokens.has(candidate)) || null;
  return {
    available: Boolean(matchedNeedle),
    matchedNeedle,
    parsedFormat: parsed.format,
  };
}
