// Generated from ../../../../scripts/ops/integrations/model/symphony-bridge-truncation.mjs:84

import { CHARS_PER_TOKEN } from "./chars-per-token.mjs";

export function estimateTokens(text) {
  if (!text) return 0;
  const str = typeof text === "string" ? text : JSON.stringify(text);
  return Math.ceil(str.length / CHARS_PER_TOKEN);
}
