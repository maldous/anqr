// After this many consecutive unhealthy health checks, restart the service.
// Bridges that are "active but unhealthy" for extended periods (e.g. hung event loop)
// will not recover on their own — this forces a restart to break the cycle.
export const CONSECUTIVE_UNHEALTHY_MAX = 5;
