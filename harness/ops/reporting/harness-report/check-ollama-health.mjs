import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PING_TIMEOUT_MS } from "./ping-timeout-ms.mjs";
import { PINNED_MODEL } from "./pinned-model.mjs";

export async function checkOllamaHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/version`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();

    const tagsController = new AbortController();
    const tagsTimer = setTimeout(() => tagsController.abort(), PING_TIMEOUT_MS);
    const tagsRes = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: tagsController.signal });
    clearTimeout(tagsTimer);
    const tagsData = await tagsRes.json();
    const models = (tagsData.models || []).map((m) => m.name);
    const found = models.includes(PINNED_MODEL);

    if (found) {
      return { pass: true, detail: `Ollama v${data.version} running, ${PINNED_MODEL} available` };
    }
    return {
      pass: false,
      detail: `Ollama v${data.version} running but ${PINNED_MODEL} not found. Available: ${models.join(", ") || "none"}`,
    };
  } catch (err) {
    return { pass: false, detail: `Ollama unreachable at ${OLLAMA_BASE}: ${err.message}` };
  }
}
