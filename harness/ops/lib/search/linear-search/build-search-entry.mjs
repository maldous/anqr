import { extractTitle } from "./extract-title.mjs";
import { normalizeText } from "./normalize-text.mjs";
import { tokenize } from "./tokenize.mjs";

export function buildSearchEntry(entry) {
  const title = extractTitle(entry.content);
  const state = entry.metadata?.state || "Unknown";
  const priority = entry.metadata?.priority || "None";
  const updatedAt = entry.metadata?.updatedAt || null;
  const searchableText = [
    entry.metadata?.identifier || "",
    title,
    state,
    priority,
    entry.content,
  ].join("\n");

  return {
    ...entry,
    title,
    state,
    priority,
    updatedAt,
    excerpt: entry.content.slice(0, 300),
    searchTokens: tokenize(searchableText),
    searchableText: normalizeText(searchableText),
  };
}
