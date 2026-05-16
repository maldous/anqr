// Track consecutive unhealthy health checks per service.
// Reset on healthy check, increment on unhealthy check.
// When threshold is exceeded, the watchdog triggers a restart.
export const consecutiveUnhealthyCount = new Map();
