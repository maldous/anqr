export function collectTokens(value, tokens) {
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
