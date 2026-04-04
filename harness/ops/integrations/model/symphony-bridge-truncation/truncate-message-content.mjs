// Generated from ../../../../scripts/ops/integrations/model/symphony-bridge-truncation.mjs:114

import { truncateString } from "./truncate-string.mjs";

export function truncateMessageContent(msg, maxChars) {
  const clone = { ...msg };
  if (typeof clone.content === "string") {
    clone.content = truncateString(clone.content, maxChars);
  } else if (Array.isArray(clone.content)) {
    clone.content = clone.content.map((part) => {
      if (part.type === "text" && part.text && part.text.length > maxChars) {
        return { ...part, text: truncateString(part.text, maxChars) };
      }
      if (part.type === "tool-result" && part.result) {
        const resultStr =
          typeof part.result === "string" ? part.result : JSON.stringify(part.result);
        if (resultStr.length > maxChars) {
          return { ...part, result: truncateString(resultStr, maxChars) };
        }
      }
      return part;
    });
  }
  return clone;
}
