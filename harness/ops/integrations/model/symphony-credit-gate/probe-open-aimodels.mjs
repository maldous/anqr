import { LOCAL_PROBE_TIMEOUT_MS } from "./local-probe-timeout-ms.mjs";
import { PROBE_TIMEOUT_MS } from "./probe-timeout-ms.mjs";
import { probeOpenrouterInvocation } from "./probe-openrouter-invocation.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeOpenAIModels(providerName, baseUrl, model, apiKey, isLocal = false) {
  const timeoutMs = isLocal ? LOCAL_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS;
  if (baseUrl?.includes("openrouter.ai")) {
    const available = await probeOpenrouterInvocation(baseUrl, model, apiKey, timeoutMs);
    saveProbeResult(providerName, available, {
      status: available ? "success" : "unavailable",
      reason: available ? "model invocation succeeded" : "openrouter invocation failed",
      message: available ? "model invocation succeeded" : "openrouter invocation failed",
      detail: available ? "model invocation succeeded" : "openrouter invocation failed",
    });
    return available;
  }
  const res = await probeWithTimeout(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeoutMs,
  });
  if (!res) return false;
  const text = await res.text();
  if (!res.ok) {
    saveProbeResult(providerName, false, {
      status: `http_${res.status}`,
      reason: `HTTP ${res.status}`,
      message: text,
      detail: text,
    });
    return false;
  }
  const available = text.includes(model);
  saveProbeResult(providerName, available, {
    status: available ? "success" : "unsupported",
    reason: available ? "model found in provider catalog" : "model missing from provider catalog",
    message: text,
    detail: text,
  });
  return available;
}
