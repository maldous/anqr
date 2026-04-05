import { catalogModelLookup } from './catalog-model-lookup.mjs';
import { classifyProviderProbeError } from './classify-provider-probe-error.mjs';
import { classifyProviderProbeHttpStatus } from './classify-provider-probe-http-status.mjs';
import { providerProbeFetchWithTimeout } from './provider-probe-fetch-with-timeout.mjs';
import { providerProbeStage } from './provider-probe-stage.mjs';
import { providerProbeTruncate } from './provider-probe-truncate.mjs';

export async function probeHttpModelListDetailed(provider, apiKey, options = {}) {
  const startedAt = Date.now();
  const stages = [];
  const timeoutMs = options.timeoutMs;
  const url = options.url || `${provider.baseUrl}/models`;
  const headers = options.headers || { Authorization: `Bearer ${apiKey}` };
  try {
    stages.push(providerProbeStage('fetch_started', { url, timeoutMs }));
    const response = await providerProbeFetchWithTimeout(url, { headers }, timeoutMs);
    const bodyText = await response.text();
    const body = providerProbeTruncate(bodyText);
    stages.push(providerProbeStage('fetch_completed', { status: response.status }));
    if (!response.ok) {
      const http = classifyProviderProbeHttpStatus(response.status);
      const bodySummary = body ? `: ${body}` : '';
      return {
        available: false,
        status: http.status,
        reason: `${http.reason}${bodySummary}`,
        durationMs: Date.now() - startedAt,
        message: body,
        httpStatus: response.status,
        stages,
      };
    }
    const lookup = catalogModelLookup(bodyText, provider);
    stages.push(providerProbeStage('catalog_checked', lookup));
    return {
      available: lookup.available,
      status: lookup.available ? 'success' : 'unsupported',
      reason: lookup.available
        ? `model found in provider catalog (${lookup.parsedFormat}, matched ${lookup.matchedNeedle})`
        : `model missing from provider catalog (${lookup.parsedFormat})`,
      durationMs: Date.now() - startedAt,
      message: body,
      httpStatus: response.status,
      stages,
    };
  } catch (error) {
    const classified = classifyProviderProbeError(error?.message || error);
    stages.push(providerProbeStage('fetch_failed', { status: classified.status }));
    return {
      available: false,
      status: classified.status,
      reason: classified.reason,
      durationMs: Date.now() - startedAt,
      message: providerProbeTruncate(error?.message || error),
      stages,
    };
  }
}
