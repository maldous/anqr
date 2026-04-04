// Generated from ../../../../scripts/ops/runtime/mcp/context7-http-service.mjs:48

export const PORT = Number.parseInt(
  process.argv.find((a, i) => process.argv[i - 1] === "--port") ||
    process.env.CONTEXT7_HTTP_PORT ||
    "4320",
  10,
);
