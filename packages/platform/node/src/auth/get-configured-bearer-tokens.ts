export function getConfiguredBearerTokens(): string[] {
  const raw = process.env.MCP_BEARER_TOKEN || process.env.MCP_BEARER_TOKENS || "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
