import { HEALTHY_DURATION_MS } from "./healthy-duration-ms.mjs";
import { checkServiceHealth } from "./check-service-health.mjs";
import { extractServiceName } from "./extract-service-name.mjs";
import { logInfo, logDebug } from "./logger.mjs";

export async function canAutoResolve(issue) {
  const service = extractServiceName(issue);

  if (!service) {
    logDebug(`[incident-resolver] ${issue.identifier}: No service found, cannot auto-resolve`);
    return { canResolve: false, reason: "no service identified" };
  }

  // Check service health
  const health = await checkServiceHealth(service);

  if (!health.healthy) {
    logDebug(
      `[incident-resolver] ${issue.identifier}: Service ${service} still unhealthy (${health.reason})`,
    );
    return { canResolve: false, reason: `service unhealthy: ${health.reason}` };
  }

  // Check how long the incident has been open
  const incidentAge = Date.now() - new Date(issue.createdAt).getTime();

  // Must be healthy for at least HEALTHY_DURATION_MS since incident creation
  if (incidentAge < HEALTHY_DURATION_MS) {
    const remainingMs = HEALTHY_DURATION_MS - incidentAge;
    const remainingMin = Math.ceil(remainingMs / (60 * 1000));
    logDebug(
      `[incident-resolver] ${issue.identifier}: Service healthy but incident too recent (${remainingMin}min remaining)`,
    );
    return {
      canResolve: false,
      reason: `waiting for ${remainingMin}min healthy period`,
    };
  }

  logInfo(
    `[incident-resolver] ${issue.identifier}: Service ${service} healthy for >1h, can auto-resolve`,
  );
  return {
    canResolve: true,
    service,
    healthData: health.data,
  };
}
