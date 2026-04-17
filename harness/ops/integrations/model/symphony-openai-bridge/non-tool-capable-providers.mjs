export const nonToolCapableProviders = new Set([
  // cerebras: emits raw JSON tool calls instead of proper tool_call format
  "cerebras",
]);
