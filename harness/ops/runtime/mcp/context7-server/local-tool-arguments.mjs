import { getToolPropertyNames } from "./tool-input-schema.mjs";

function normalizedTopic(topic, libraryTitle) {
  if (topic && String(topic).trim()) return String(topic).trim();
  return `Documentation and examples for ${libraryTitle}`;
}

export function buildResolveArguments(tool, libraryTitle, topic) {
  const supported = getToolPropertyNames(tool);
  const args = {};

  if (supported.size === 0 || supported.has("libraryName")) {
    args.libraryName = libraryTitle;
  }

  if (supported.has("query")) {
    args.query = topic
      ? `Documentation for ${libraryTitle} focusing on ${topic}`
      : `Documentation for ${libraryTitle}`;
  }

  return args;
}

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
