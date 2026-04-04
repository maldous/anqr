import { getToolPropertyNames } from "./get-tool-property-names.mjs";
import { normalizedTopic } from "./normalized-topic.mjs";

export function buildDocsArguments(tool, libraryId, libraryTitle, topic, maxTokens = 5000) {
  const supported = getToolPropertyNames(tool);
  const args = {};

  if (supported.size === 0 || supported.has("context7CompatibleLibraryID")) {
    args.context7CompatibleLibraryID = libraryId;
  } else if (supported.has("libraryId")) {
    args.libraryId = libraryId;
  } else {
    args.context7CompatibleLibraryID = libraryId;
  }

  if (supported.has("topic")) {
    args.topic = topic || undefined;
  }

  if (supported.has("query")) {
    args.query = normalizedTopic(topic, libraryTitle);
  }

  if (supported.has("tokens")) {
    args.tokens = Math.max(1000, Number(maxTokens) || 5000);
  }

  if (supported.has("max_tokens")) {
    args.max_tokens = Math.max(1000, Number(maxTokens) || 5000);
  }

  if (supported.has("page")) {
    args.page = 1;
  }

  return Object.fromEntries(Object.entries(args).filter(([, value]) => value !== undefined));
}
