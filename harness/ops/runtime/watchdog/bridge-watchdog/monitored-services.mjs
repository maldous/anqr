export const MONITORED_SERVICES = [
  {
    name: "anqr-symphony-router.service",
    shortName: "symphony-router",
    port: 4319,
    criticalFiles: [
      "harness/ops/integrations/model/symphony-agent-router.mjs",
      "harness/ops/integrations/model/symphony-credit-gate.mjs",
      "harness/ops/integrations/model/symphony-openai-bridge.mjs",
      "harness/ops/integrations/model/codebuff-direct.mjs",
    ],
    healthEndpoint: "http://127.0.0.1:4319/health",
    skipProviderCheck: true, // Router is a proxy; providers are checked on executors
  },
];
