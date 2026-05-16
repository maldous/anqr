// Bridges return large JSON (~628 providers) that can take 5+ seconds to serialize,
// causing false "unhealthy" reports with the old 5s timeout
export const HEALTH_CHECK_TIMEOUT_MS = 10_000;
