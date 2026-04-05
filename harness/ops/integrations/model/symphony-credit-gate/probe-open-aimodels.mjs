import { LOCAL_PROBE_TIMEOUT_MS } from "./local-probe-timeout-ms.mjs";
import { PROBE_TIMEOUT_MS } from "./probe-timeout-ms.mjs";
import { probeOpenrouterInvocation } from "./probe-openrouter-invocation.mjs";
import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeOpenAIModels(baseUrl, model, apiKey, isLocal = false) {
  const timeoutMs = isLocal ? LOCAL_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS;
  if (String(baseUrl || "").includes("openrouter.ai")) {
    return probeOpenrouterInvocation(baseUrl, model, apiKey, timeoutMs);
  }
  const res = await probeWithTimeout(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeoutMs,
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}
