// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3212

export const additionalTokens = (process.env.SYMPHONY_BRIDGE_ACCEPTED_TOKENS || "")
  .split(",")
  .map((t) => t.trim())
  .filter(Boolean);
