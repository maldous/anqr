import { RUNNER_OLLAMA_BASE_URL } from "../../../symphony-config.mjs";

import { probeWithTimeout } from "./probe-with-timeout.mjs";

export async function probeOllamaModel(modelName) {
  const res = await probeWithTimeout(`${RUNNER_OLLAMA_BASE_URL.replace("/v1", "")}/api/tags`);
  if (!res || !res.ok) return false;
  try {
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    return models.includes(modelName);
  } catch {
    return false;
  }
}
