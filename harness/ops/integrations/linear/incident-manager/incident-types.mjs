// Generated from ../../../../scripts/ops/integrations/linear/incident-manager.mjs:21

export const INCIDENT_TYPES = {
  WATCHDOG_ROLLBACK: {
    priority: 0, // P0
    titlePrefix: "Watchdog rollback",
    estimate: 3,
  },
  RAPID_RESTART: {
    priority: 1, // P1
    titlePrefix: "Rapid restart pattern",
    estimate: 3,
  },
  PROVIDERS_EXHAUSTED: {
    priority: 1, // P1
    titlePrefix: "All providers exhausted",
    estimate: 2,
  },
  RETRY_EXHAUSTED: {
    priority: 2, // P2
    titlePrefix: "Issue retry exhausted",
    estimate: 2,
  },
  BUILD_FAILURE: {
    priority: 0, // P0 - blocks all work
    titlePrefix: "Build failure",
    estimate: 2,
  },
  DEPLOYMENT_FAILURE: {
    priority: 0, // P0 - production impact
    titlePrefix: "Deployment failure",
    estimate: 2,
  },
  TEST_FAILURE: {
    priority: 1, // P1 - CI breakage
    titlePrefix: "Test suite failure",
    estimate: 2,
  },
  VALIDATION_FAILURE: {
    priority: 1, // P1 - quality gate breakage
    titlePrefix: "Validation failure",
    estimate: 2,
  },
  MONITORING_ALERT: {
    priority: 1, // P1 - operational issue
    titlePrefix: "Monitoring alert",
    estimate: 2,
  },
  SERVICE_UNHEALTHY: {
    priority: 0, // P0 - service down
    titlePrefix: "Service health check failed",
    estimate: 3,
  },
};
