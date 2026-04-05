import { LOCAL_PROBE_TIMEOUT_MS } from "./local-probe-timeout-ms.mjs";
import { probeHttpModelListDetailed } from "./probe-http-model-list-detailed.mjs";

export async function probeOllamaDetailed(provider) {
  const baseUrl = provider.baseUrl || "http://127.0.0.1:11434/v1";
  const base = baseUrl.replace(/\/v1\/?$/, "");
  return probeHttpModelListDetailed(provider, "", {
    url: `${base}/api/tags`,
    headers: {},
    timeoutMs: LOCAL_PROBE_TIMEOUT_MS,
  });
}
