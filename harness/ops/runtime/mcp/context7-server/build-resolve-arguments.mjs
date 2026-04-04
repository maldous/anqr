import { getToolPropertyNames } from "./get-tool-property-names.mjs";

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
