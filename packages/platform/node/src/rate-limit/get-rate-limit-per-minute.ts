export function getRateLimitPerMinute(): number {
  const configured = Number(process.env.MCP_RATE_LIMIT_PER_MINUTE || "30");
  return Number.isFinite(configured) && configured > 0 ? configured : 30;
}
