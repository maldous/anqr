import { estimateTokens } from "./estimate-tokens.mjs";

export function estimateMessagesTokens(messages) {
  let total = 0;
  for (const msg of messages) {
    total += 4; // per-message overhead (role, delimiters)
    if (typeof msg.content === "string") {
      total += estimateTokens(msg.content);
    } else if (Array.isArray(msg.content)) {
      for (const part of msg.content) {
        total += estimateTokens(part.text || part.content || JSON.stringify(part));
      }
    }
  }
  return total;
}
