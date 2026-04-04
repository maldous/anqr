import { RRF_K } from "./rrf-k.mjs";

export function reciprocalRankFusion(bm25Results, embeddingResults, bm25Weight, embeddingWeight) {
  /** @type {Map<string, {bm25Score: number, embeddingScore: number, data: object}>} */
  const merged = new Map();

  // Score each BM25 result by its rank.
  for (let rank = 0; rank < bm25Results.length; rank++) {
    const r = bm25Results[rank];
    const rrfScore = 1 / (RRF_K + rank + 1);
    const entry = merged.get(r.path) || {
      bm25Score: 0,
      embeddingScore: 0,
      data: r,
    };
    entry.bm25Score = rrfScore;
    merged.set(r.path, entry);
  }

  // Score each embedding result by its rank.
  for (let rank = 0; rank < embeddingResults.length; rank++) {
    const r = embeddingResults[rank];
    const rrfScore = 1 / (RRF_K + rank + 1);
    const entry = merged.get(r.path) || {
      bm25Score: 0,
      embeddingScore: 0,
      data: r,
    };
    entry.embeddingScore = rrfScore;
    if (!entry.data.content && r.content) entry.data = r;
    merged.set(r.path, entry);
  }

  // Combine weighted scores.
  const results = [];
  for (const [path, entry] of merged) {
    const score = entry.bm25Score * bm25Weight + entry.embeddingScore * embeddingWeight;
    results.push({
      path,
      score,
      bm25Score: entry.bm25Score,
      embeddingScore: entry.embeddingScore,
      content: entry.data.content,
    });
  }

  // Sort descending by combined score.
  results.sort((a, b) => b.score - a.score);

  return results;
}
