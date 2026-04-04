import { MAX_DESCRIPTION_CHARS } from "./max-description-chars.mjs";
import { compactWhitespace } from "./compact-whitespace.mjs";

export function truncateDescription(description) {
  const compacted = compactWhitespace(description);
  if (compacted.length <= MAX_DESCRIPTION_CHARS) return compacted;
  return `${compacted.slice(0, MAX_DESCRIPTION_CHARS).trim()}\n\n[truncated for embedding efficiency]`;
}
