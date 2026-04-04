export function extractSnippet(content, query, radius = 120) {
  if (!content || !query) return "";

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const lower = content.toLowerCase();
  let bestIdx = -1;

  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1) {
      bestIdx = idx;
      break;
    }
  }

  if (bestIdx === -1) {
    // No match found — return the opening of the file.
    return content.slice(0, radius * 2).trim();
  }

  const start = Math.max(0, bestIdx - radius);
  const end = Math.min(content.length, bestIdx + radius);
  let snippet = content.slice(start, end).trim();

  if (start > 0) snippet = "…" + snippet;
  if (end < content.length) snippet = snippet + "…";

  return snippet;
}
