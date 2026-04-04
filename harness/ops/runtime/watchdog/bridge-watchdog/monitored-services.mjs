// Generated from ../../../../harness/ops/runtime/watchdog/bridge-watchdog.mjs:39

export const MONITORED_SERVICES = [
  {
    name: "anqr-symphony-bridge.service",
    shortName: "symphony-agent",
    port: 4319,
    criticalFiles: [
      "harness/ops/integrations/model/symphony-agent-router.mjs",
      "harness/ops/integrations/model/symphony-credit-gate.mjs",
      "harness/ops/integrations/model/symphony-openai-bridge.mjs",
      "harness/ops/integrations/model/codebuff-direct.mjs",
    ],
    healthEndpoint: "http://127.0.0.1:4319/health",
  },
];
