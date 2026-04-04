import { collectDocumentation } from "./collect-documentation.mjs";

export function extractDocumentation(result) {
  if (!result) return null;

  const parts = [];
  collectDocumentation(result, parts);

  const seen = new Set();
  const deduped = [];
  for (const part of parts) {
    const key = part.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(key);
  }

  return deduped.length > 0 ? deduped.join("\n\n") : null;
}
