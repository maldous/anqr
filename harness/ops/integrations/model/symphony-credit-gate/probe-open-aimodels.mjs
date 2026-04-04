import { LOCAL_PROBE_TIMEOUT_MS } from "./local-probe-timeout-ms.mjs";
import { PROBE_TIMEOUT_MS } from "./probe-timeout-ms.mjs";
import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeOpenAIModels(baseUrl, model, apiKey, isLocal = false) {
  // Use longer timeout for local bridges (Codebuff on port 4318) which may take 3-5s to respond
  const timeoutMs = isLocal ? LOCAL_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS;
  const res = await probeWithTimeout(`${baseUrl}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    timeoutMs,
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return text.includes(model);
}
