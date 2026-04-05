import { classifyProviderProbeHttpStatus } from "./classify-provider-probe-http-status.mjs";
import { providerProbeFetchWithTimeout } from "./provider-probe-fetch-with-timeout.mjs";
import { providerProbeStage } from "./provider-probe-stage.mjs";
import { providerProbeCatalogAvailable } from "./provider-probe-catalog-available.mjs";
import { providerProbeCatalogMatchedNeedle } from "./provider-probe-catalog-matched-needle.mjs";
import { providerProbeTruncate } from "./provider-probe-truncate.mjs";

export async function probeHttpModelListDetailed(provider, apiKey, options = {}) {
  const startedAt = Date.now();
  const stages = [];
  const timeoutMs = options.timeoutMs;
  const url =
    options.url || provider.modelsUrl || (provider.baseUrl ? `${provider.baseUrl}/models` : null);
  const headers = options.headers || (provider.envVar ? { Authorization: `Bearer ${apiKey}` } : {});
  stages.push(providerProbeStage("fetch_started", { url, timeoutMs }));
  if (!url) {
    const message = `provider probe misconfigured: no modelsUrl/baseUrl for ${provider.name}`;
    stages.push(providerProbeStage("fetch_failed", { message }));
    return {
      available: false,
      status: "configuration_error",
      reason: message,
      durationMs: Date.now() - startedAt,
      message,
      stages,
    };
  }
  try {
    const response = await providerProbeFetchWithTimeout(url, { headers }, timeoutMs);
    const bodyText = await response.text();
    const body = providerProbeTruncate(bodyText, 48000);
    stages.push(providerProbeStage("fetch_completed", { status: response.status }));
    if (!response.ok) {
      const http = classifyProviderProbeHttpStatus(response.status);
      return {
        available: false,
        status: http.status,
        reason: `${http.reason}: ${body}`,
        durationMs: Date.now() - startedAt,
        message: body,
        httpStatus: response.status,
        stages,
      };
    }
    const matchedNeedle = providerProbeCatalogMatchedNeedle(provider, bodyText);
    const available = providerProbeCatalogAvailable(provider, bodyText);
    stages.push(
      providerProbeStage("catalog_checked", {
        available,
        matchedNeedle,
        parsedFormat: /^[[{]/.test(bodyText.trim()) ? "json" : "text",
      }),
    );
    return {
      available,
      status: available ? "success" : "unavailable",
      reason: available
        ? `model found in provider catalog`
        : `model not found in provider catalog`,
      durationMs: Date.now() - startedAt,
      message: body,
      httpStatus: response.status,
      stages,
    };
  } catch (error) {
    stages.push(
      providerProbeStage("fetch_failed", {
        message: providerProbeTruncate(error?.message || error, 12000),
      }),
    );
    return {
      available: false,
      status: "network_error",
      reason: `provider probe failed: ${error?.message || error}`,
      durationMs: Date.now() - startedAt,
      message: providerProbeTruncate(error?.message || error, 12000),
      stages,
    };
  }
}
