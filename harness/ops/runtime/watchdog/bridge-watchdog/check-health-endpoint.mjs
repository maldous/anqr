import { HEALTH_CHECK_TIMEOUT_MS } from "./health-check-timeout-ms.mjs";

export async function checkHealthEndpoint(service) {
  const { healthEndpoint } = service;

  if (!healthEndpoint) {
    return { healthy: true, reason: "no health endpoint configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS);

    const response = await fetch(healthEndpoint, {
      signal: controller.signal,
      method: "GET",
    });

    clearTimeout(timeout);

    if (response.ok) {
      try {
        const data = await response.json();
        const available = data.providersAvailable || 0;
        const configured = data.providersConfigured || 0;
        if (available === 0) {
          return {
            healthy: false,
            reason: `no providers available (${available}/${configured} configured)`,
          };
        }
        return {
          healthy: true,
          reason: `healthy (${available}/${configured} providers)`,
        };
      } catch {
        return { healthy: true, reason: "responded OK" };
      }
    } else {
      return { healthy: false, reason: `HTTP ${response.status}` };
    }
  } catch (err) {
    const errStr = err.message || String(err);
    if (errStr.includes("abort")) {
      return { healthy: false, reason: "health check timeout" };
    }
    return { healthy: false, reason: `connection failed: ${errStr.slice(0, 50)}` };
  }
}
