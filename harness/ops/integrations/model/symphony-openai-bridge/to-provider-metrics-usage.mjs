// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3735

export function toProviderMetricsUsage(usage = {}) {
  return {
    inputTokens: usage?.promptTokens || usage?.inputTokens || 0,
    outputTokens: usage?.completionTokens || usage?.outputTokens || 0,
  };
}
