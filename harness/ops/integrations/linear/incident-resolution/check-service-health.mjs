// Generated from ../../../../scripts/ops/integrations/linear/incident-resolution.mjs:24

import { HEALTH_ENDPOINTS } from "./health-endpoints.mjs";

export async function checkServiceHealth(service) {
  const endpoint = HEALTH_ENDPOINTS[service];
  if (!endpoint) {
    return { healthy: false, reason: "no health endpoint configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      signal: controller.signal,
      method: "GET",
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return {
        healthy: true,
        status: data.status || "ok",
        data,
      };
    } else {
      return { healthy: false, reason: `HTTP ${response.status}` };
    }
  } catch (err) {
    return { healthy: false, reason: err.message };
  }
}
