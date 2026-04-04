export function toProviderMetricsUsage(usage = {}) {
  return {
    inputTokens: usage?.promptTokens || usage?.inputTokens || 0,
    outputTokens: usage?.completionTokens || usage?.outputTokens || 0,
  };
}
