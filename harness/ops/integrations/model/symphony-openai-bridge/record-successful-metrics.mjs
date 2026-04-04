// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3742

import { recordProviderMetrics } from "../symphony-credit-gate.mjs";

import { toProviderMetricsUsage } from "./to-provider-metrics-usage.mjs";

export function recordSuccessfulMetrics(providerName, startedAt, usage, validationPassed = true) {
  const { inputTokens, outputTokens } = toProviderMetricsUsage(usage);
  recordProviderMetrics(providerName, {
    durationMs: Date.now() - startedAt,
    inputTokens,
    outputTokens,
    validationPassed,
  });
}
