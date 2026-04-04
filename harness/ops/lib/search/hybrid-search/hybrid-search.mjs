// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:281

import { cosineSimilarity } from "./cosine-similarity.mjs";
import { embeddingsAvailable } from "./embeddings-available.mjs";
import { extractSnippet } from "./extract-snippet.mjs";
import { generateEmbedding } from "./generate-embedding.mjs";
import { miniSearchIndex } from "./mini-search-index.mjs";
import { reciprocalRankFusion } from "./reciprocal-rank-fusion.mjs";
import { vectorSearch } from "./vector-search.mjs";
import { vectorStoreReady } from "./vector-store-ready.mjs";
import { logDebug, logWarn, logError } from "./logger.mjs";

export async function hybridSearch(query, options = {}) {
  const { topK = 20, bm25Weight = 0.5, embeddingWeight = 0.5, useEmbeddings = true } = options;

  if (!query || typeof query !== "string") {
    logWarn("hybridSearch called with empty or invalid query");
    return [];
  }

  // ---- Step 1: BM25 search via MiniSearch ----
  let bm25Results = [];

  if (miniSearchIndex) {
    try {
      const raw = miniSearchIndex.search(query, { limit: 50 });
      bm25Results = raw.map((hit) => ({
        path: hit.path ?? "",
        content: hit.content ?? "",
        score: hit.score,
      }));
      logDebug(`BM25 returned ${bm25Results.length} results for "${query}"`);
    } catch (err) {
      logError("BM25 search failed", { error: err.message });
    }
  } else {
    logWarn("BM25 index not built — skipping keyword search");
  }

  // ---- Step 2: Embedding / vector search (optional) ----
  let embeddingResults = [];

  if (useEmbeddings) {
    try {
      const canEmbed = await embeddingsAvailable();
      const vectorReady = vectorStoreReady();

      if (canEmbed && vectorReady && vectorSearch) {
        const raw = await vectorSearch(query, 50);
        embeddingResults = (raw ?? []).map((hit) => ({
          path: hit.path ?? hit.id ?? "",
          content: hit.content ?? "",
          score: hit.score ?? 0,
        }));
        logDebug(`Embedding search returned ${embeddingResults.length} results for "${query}"`);
      } else if (canEmbed && generateEmbedding && bm25Results.length > 0) {
        // Fallback: re-rank BM25 results using cosine similarity when vector
        // store is not ready but embeddings are available.
        logDebug("Vector store not ready — re-ranking BM25 via embeddings");
        const queryEmbedding = await generateEmbedding(query);
        if (queryEmbedding) {
          const scored = [];
          for (const r of bm25Results.slice(0, 50)) {
            try {
              const docEmbedding = await generateEmbedding(r.content.slice(0, 2048));
              if (docEmbedding) {
                const sim = cosineSimilarity(queryEmbedding, docEmbedding);
                scored.push({ ...r, score: sim });
              }
            } catch {
              // skip individual failures
            }
          }
          scored.sort((a, b) => b.score - a.score);
          embeddingResults = scored;
        }
      } else {
        logDebug("Embeddings unavailable — using BM25-only search");
      }
    } catch (err) {
      logWarn("Embedding search failed — falling back to BM25-only", {
        error: err.message,
      });
    }
  }

  // ---- Step 3: Reciprocal Rank Fusion ----
  let finalResults;

  if (embeddingResults.length > 0 && bm25Results.length > 0) {
    finalResults = reciprocalRankFusion(bm25Results, embeddingResults, bm25Weight, embeddingWeight);
  } else if (bm25Results.length > 0) {
    // BM25-only — normalise scores to 0–1 range.
    const maxScore = bm25Results[0]?.score || 1;
    finalResults = bm25Results.map((r) => ({
      path: r.path,
      score: r.score / maxScore,
      bm25Score: r.score / maxScore,
      embeddingScore: 0,
      content: r.content,
    }));
  } else if (embeddingResults.length > 0) {
    finalResults = embeddingResults.map((r) => ({
      path: r.path,
      score: r.score,
      bm25Score: 0,
      embeddingScore: r.score,
      content: r.content,
    }));
  } else {
    return [];
  }

  // ---- Step 4: Return top-K with snippets ----
  return finalResults.slice(0, topK).map((r) => ({
    path: r.path,
    score: r.score,
    bm25Score: r.bm25Score,
    embeddingScore: r.embeddingScore,
    snippet: extractSnippet(r.content ?? "", query),
  }));
}
