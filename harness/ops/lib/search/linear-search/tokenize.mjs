// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:40

import { normalizeText } from "./normalize-text.mjs";

export function tokenize(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}
