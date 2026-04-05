import { classifyProviderProbeHttpStatus } from "./classify-provider-probe-http-status.mjs";
import { providerProbeFetchWithTimeout } from "./provider-probe-fetch-with-timeout.mjs";
import { providerProbeStage } from "./provider-probe-stage.mjs";
import { providerProbeTruncate } from "./provider-probe-truncate.mjs";

export async function probeOpenrouterDetailed(provider, apiKey, options = {}) {
  const startedAt = Date.now();
  const stages = [];
  const timeoutMs = options.timeoutMs;
  const url = `${provider.baseUrl}/chat/completions`;
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({
    model: provider.model,
    messages: [{ role: "user", content: "Reply with exactly: ok" }],
    max_tokens: 8,
  });
  stages.push(providerProbeStage("invoke_started", { url, timeoutMs, model: provider.model }));
  const response = await providerProbeFetchWithTimeout(
    url,
    { method: "POST", headers, body },
    timeoutMs,
  );
  const text = providerProbeTruncate(await response.text());
  stages.push(providerProbeStage("invoke_completed", { status: response.status }));
  if (!response.ok) {
    const http = classifyProviderProbeHttpStatus(response.status);
    return {
      available: false,
      status: http.status,
      reason: `${http.reason}: ${text}`,
      durationMs: Date.now() - startedAt,
      message: text,
      httpStatus: response.status,
      stages,
    };
  }
  return {
    available: true,
    status: "success",
    reason: "model invocation succeeded",
    durationMs: Date.now() - startedAt,
    message: text,
    httpStatus: response.status,
    stages,
  };
}
