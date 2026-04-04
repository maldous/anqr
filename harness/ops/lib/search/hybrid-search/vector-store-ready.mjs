// Generated from ../../../../scripts/ops/lib/search/hybrid-search.mjs:150

import { isIndexReady } from "./is-index-ready.mjs";

export function vectorStoreReady() {
  try {
    return typeof isIndexReady === "function" && isIndexReady();
  } catch {
    return false;
  }
}
