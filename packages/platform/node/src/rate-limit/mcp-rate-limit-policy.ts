export const MCP_RATE_LIMIT_POLICY = {
  route: "/api/mcp",
  requestsPerMinute: 30,
  perimeterOwner: "netlify",
  fallbackOwner: "@anqr/platform-node/rate-limit",
} as const;
