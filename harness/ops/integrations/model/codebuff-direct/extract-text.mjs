import { extractTextFromUnknown } from "./extract-text-from-unknown.mjs";

export function extractText(output) {
  const parts = extractTextFromUnknown(output, []);
  const joined = parts
    .map(String)
    .filter(Boolean)
    .join("\n")
    .trim();
  return joined;
}
