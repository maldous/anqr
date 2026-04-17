export const BRIDGE_PROVIDER_BLOCKLIST = new Set([
  // cerebras-gpt-oss-120b: model doesn't exist on Cerebras API (404)
  "cerebras-gpt-oss-120b",
  // cerebras-zai-glm-4-7: model doesn't exist on Cerebras API (404)
  "cerebras-zai-glm-4-7",
]);
