import { buildProviderProbeFailureBreakdown } from './build-provider-probe-failure-breakdown.mjs';
import { buildProviderProbeSelectorSummary } from './build-provider-probe-selector-summary.mjs';
import { buildProviderProbeSummary } from './build-provider-probe-summary.mjs';
import { buildProviderProbeToolSummary } from './build-provider-probe-tool-summary.mjs';

export function buildProviderProbeReport(generatedAt, results) {
  return {
    generatedAt,
    results,
    selector: buildProviderProbeSelectorSummary(results),
    failureBreakdown: buildProviderProbeFailureBreakdown(results),
    toolSummary: buildProviderProbeToolSummary(results),
    summary: buildProviderProbeSummary(results),
  };
}
