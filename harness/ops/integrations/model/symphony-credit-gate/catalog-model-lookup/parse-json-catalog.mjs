import { collectTokens } from "./collect-tokens.mjs";

export function parseJsonCatalog(value) {
  const tokens = new Set();
  collectTokens(value, tokens);
  return { format: "json", tokens };
}
