// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:105

export function computeLexicalScore(queryTokens, entry) {
  if (queryTokens.length === 0) return 0;
  const tokenSet = new Set(entry.searchTokens);
  let matched = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) matched += 1;
  }

  const coverage = matched / queryTokens.length;
  const phraseBoost = entry.searchableText.includes(queryTokens.join(" ")) ? 0.25 : 0;
  return coverage + phraseBoost;
}
