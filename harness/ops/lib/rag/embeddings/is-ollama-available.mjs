import { OLLAMA_BASE } from "./ollama-base.mjs";
import { PING_TIMEOUT_MS } from "./ping-timeout-ms.mjs";
import { fetchJsonWithTimeout } from "./fetch-json-with-timeout.mjs";
import { healthCache } from "./health-cache.mjs";
import { rememberHealth } from "./remember-health.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function isOllamaAvailable(options = {}) {
  const force = Boolean(options.force);
  const now = Date.now();

  if (!force) {
    if (healthCache.value !== null && healthCache.expiresAt > now) {
      return healthCache.value;
    }
    if (healthCache.value === false && healthCache.nextRetryAt > now) {
      return false;
    }
  }

  try {
    const response = await fetchJsonWithTimeout(`${OLLAMA_BASE}/api/version`, {}, PING_TIMEOUT_MS);
    if (!response.ok) {
      logWarn(`Ollama health check returned status ${response.status}`);
      rememberHealth(false);
      return false;
    }

    const data = await response.json().catch(() => ({}));
    logDebug(`Ollama available at ${OLLAMA_BASE}${data?.version ? ` (v${data.version})` : ""}`);
    rememberHealth(true);
    return true;
  } catch (err) {
    logWarn(`Ollama unavailable at ${OLLAMA_BASE}: ${err?.message || err}`);
    rememberHealth(false);
    return false;
  }
}
