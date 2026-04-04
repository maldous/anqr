// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:522

import { collectProjectFiles } from "./collect-project-files.mjs";
import { computeFingerprint } from "./compute-fingerprint.mjs";
import { createHybridSearchIndex } from "./create-hybrid-search-index.mjs";
import { hybridSearch } from "./hybrid-search.mjs";
import { indexFingerprint } from "./index-fingerprint.mjs";
import { miniSearchIndex } from "./mini-search-index.mjs";
import { logDebug, logError } from "./logger.mjs";

export async function searchFiles(query, options = {}) {
  const { rootDir = process.cwd(), topK = 20, useEmbeddings = true } = options;

  if (!query || typeof query !== "string") {
    return { files: [], count: 0, query: query ?? "", method: "basic" };
  }

  try {
    // ---- Collect files & build index if needed ----
    const projectFiles = await collectProjectFiles(rootDir);
    const fp = computeFingerprint(projectFiles);

    if (!miniSearchIndex || fp !== indexFingerprint) {
      createHybridSearchIndex(projectFiles);
    }

    // ---- Run hybrid search ----
    const results = await hybridSearch(query, { topK, useEmbeddings });

    if (results.length > 0) {
      const hasEmbeddings = results.some((r) => r.embeddingScore > 0);
      const method = hasEmbeddings ? "hybrid" : "bm25";
      return {
        files: results.map((r) => r.path),
        count: results.length,
        query,
        method,
      };
    }

    // ---- Fallback: basic substring search ----
    logDebug("No BM25/hybrid results — falling back to basic substring search");
    const lowerQuery = query.toLowerCase();
    const basicMatches = projectFiles
      .filter(
        (f) =>
          f.path.toLowerCase().includes(lowerQuery) || f.content.toLowerCase().includes(lowerQuery),
      )
      .slice(0, topK)
      .map((f) => f.path);

    return {
      files: basicMatches,
      count: basicMatches.length,
      query,
      method: "basic",
    };
  } catch (err) {
    logError("searchFiles failed", { error: err.message });
    return { files: [], count: 0, query, method: "basic" };
  }
}
