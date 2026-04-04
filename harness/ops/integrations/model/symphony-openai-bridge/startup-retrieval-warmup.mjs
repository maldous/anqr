// Extracted from runtime.mjs: retrieval index warmup on bridge startup.

import { warmSearchIndex } from "../../../lib/search/hybrid-search.mjs";
import { getIndexStats as getVectorIndexStats } from "../../../lib/rag/vector-store.mjs";
import { warmLinearIndex } from "../../../lib/search/linear-search.mjs";

export async function runRetrievalWarmup() {
  const enabled = process.env.ANQR_RETRIEVAL_WARMUP !== "false";
  let summary = { bm25: "skipped", vector: "skipped", linear: "skipped" };

  if (enabled) {
    try {
      const [bm25Result, vectorResult, linearResult] = await Promise.allSettled([
        warmSearchIndex({ rootDir: process.cwd() }),
        getVectorIndexStats(),
        warmLinearIndex(),
      ]);

      const bm25Status = bm25Result.value.rebuilt ? " (rebuilt)" : " (cached)";
      summary = {
        bm25:
          bm25Result.status === "fulfilled"
            ? `${bm25Result.value.documentCount} docs${bm25Status}`
            : `error: ${bm25Result.reason?.message || bm25Result.reason}`,
        vector:
          vectorResult.status === "fulfilled"
            ? `${vectorResult.value.totalEntries} entries / ${vectorResult.value.totalFiles} files`
            : `error: ${vectorResult.reason?.message || vectorResult.reason}`,
        linear:
          linearResult.status === "fulfilled"
            ? `${linearResult.value.length} indexed issues`
            : `error: ${linearResult.reason?.message || linearResult.reason}`,
      };
    } catch {
      // best effort only
    }
  }

  return { summary, enabled };
}
