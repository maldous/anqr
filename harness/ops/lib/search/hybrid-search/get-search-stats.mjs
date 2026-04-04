// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:590

import { generateEmbedding } from "./generate-embedding.mjs";
import { indexBuiltAt } from "./index-built-at.mjs";
import { indexedDocCount } from "./indexed-doc-count.mjs";
import { miniSearchIndex } from "./mini-search-index.mjs";
import { vectorStoreReady } from "./vector-store-ready.mjs";

export function getSearchStats() {
  return {
    indexed: miniSearchIndex !== null,
    documentCount: indexedDocCount,
    builtAt: indexBuiltAt ? new Date(indexBuiltAt).toISOString() : null,
    embeddingsAvailable: typeof generateEmbedding === "function",
    vectorStoreReady: vectorStoreReady(),
  };
}
