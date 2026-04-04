// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:169

import MiniSearch from "minisearch";
import { basename } from "node:path";

import { computeFingerprint } from "./compute-fingerprint.mjs";
import { indexBuiltAt, setIndexBuiltAt } from "./index-built-at.mjs";
import { indexFingerprint, setIndexFingerprint } from "./index-fingerprint.mjs";
import { indexedDocCount, setIndexedDocCount } from "./indexed-doc-count.mjs";
import { miniSearchIndex, setMiniSearchIndex } from "./mini-search-index.mjs";
import { logInfo } from "./logger.mjs";

export function createHybridSearchIndex(files) {
  logInfo(`Building BM25 index over ${files.length} files`);

  const index = new MiniSearch({
    fields: ["path", "content", "filename"],
    storeFields: ["path", "content"],
    searchOptions: {
      boost: { filename: 3, path: 2, content: 1 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  const docs = files.map((f, i) => ({
    id: i + 1,
    path: f.path,
    content: f.content,
    filename: basename(f.path),
  }));

  index.addAll(docs);

  // Cache the index at module level.
  setMiniSearchIndex(index);
  setIndexFingerprint(computeFingerprint(files));
  setIndexedDocCount(docs.length);
  setIndexBuiltAt(Date.now());

  logInfo(`BM25 index ready — ${docs.length} documents indexed`);

  return index;
}
