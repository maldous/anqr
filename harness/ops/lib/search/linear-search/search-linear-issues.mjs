// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:134

import { generateEmbedding, cosineSimilarity } from "../../rag/embeddings.mjs";

import { computeLexicalScore } from "./compute-lexical-score.mjs";
import { computeRecencyBonus } from "./compute-recency-bonus.mjs";
import { loadLinearIndex } from "./load-linear-index.mjs";
import { tokenize } from "./tokenize.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function searchLinearIssues(query, topK = 5) {
  if (!query || typeof query !== "string" || !query.trim()) {
    logWarn("searchLinearIssues called with empty query");
    return [];
  }

  const index = await loadLinearIndex();
  if (index.length === 0) {
    logWarn("Linear index is empty — no results");
    return [];
  }

  const queryTokens = tokenize(query);
  const lexicalRanked = index
    .map((entry) => ({
      entry,
      lexicalScore: computeLexicalScore(queryTokens, entry),
    }))
    .filter(({ lexicalScore }) => lexicalScore > 0)
    .sort((a, b) => b.lexicalScore - a.lexicalScore);

  const candidateLimit =
    lexicalRanked.length > 0 ? Math.min(25, lexicalRanked.length) : index.length;
  const candidates =
    lexicalRanked.length > 0
      ? lexicalRanked.slice(0, candidateLimit)
      : index.slice(0, Math.min(50, index.length)).map((entry) => ({ entry, lexicalScore: 0 }));

  // Generate embedding for the query. Fall back to lexical ranking if Ollama is unavailable.
  const queryEmbedding = await generateEmbedding(query);
  const semanticAvailable = Array.isArray(queryEmbedding) && queryEmbedding.length > 0;
  if (!semanticAvailable) {
    logWarn("Linear query embedding unavailable — falling back to lexical ranking");
  }

  const scored = [];
  for (const { entry, lexicalScore } of candidates) {
    try {
      const semanticScore =
        semanticAvailable && Array.isArray(entry.embedding) && entry.embedding.length > 0
          ? cosineSimilarity(queryEmbedding, entry.embedding)
          : 0;
      const score = semanticAvailable
        ? semanticScore * 0.75 + lexicalScore * 0.2 + computeRecencyBonus(entry.updatedAt)
        : lexicalScore + computeRecencyBonus(entry.updatedAt);
      scored.push({
        identifier: entry.metadata?.identifier || entry.id || "unknown",
        title: entry.title,
        state: entry.state,
        priority: entry.priority,
        score,
        excerpt: entry.excerpt,
        content: entry.content,
        updatedAt: entry.updatedAt,
      });
    } catch (err) {
      logDebug(`Similarity computation failed for ${entry.id}: ${err?.message || err}`);
    }
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Return top-K results
  const limit = Math.max(1, Math.min(topK, scored.length));
  const results = scored.slice(0, limit);

  logInfo(
    `Search for "${query.slice(0, 60)}": ${results.length} results (top score: ${results[0]?.score?.toFixed(4) || "N/A"})`,
  );

  return results;
}
