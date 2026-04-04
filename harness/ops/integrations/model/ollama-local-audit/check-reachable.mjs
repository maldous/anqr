import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PING_TIMEOUT_MS } from "./ping-timeout-ms.mjs";
import { record } from "./record.mjs";

export async function checkReachable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/version`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    record("ollama-reachable", true, `Ollama v${data.version} at ${OLLAMA_BASE}`);
    return true;
  } catch (err) {
    record("ollama-reachable", false, `Cannot reach Ollama at ${OLLAMA_BASE}: ${err.message}`);
    return false;
  }
}
