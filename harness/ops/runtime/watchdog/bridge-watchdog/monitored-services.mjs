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
    skipProviderCheck: true,
  },
  {
    name: "anqr-discord-router.service",
    shortName: "discord-router",
    port: 18790,
    criticalFiles: ["harness/ops/integrations/model/discord-request-router.mjs"],
    healthEndpoint: "http://127.0.0.1:18790/health",
    skipProviderCheck: true,
  },
  {
    name: "anqr-linear-webhook.service",
    shortName: "linear-webhook",
    port: 18791,
    criticalFiles: ["harness/ops/integrations/model/linear-webhook-receiver.mjs"],
    healthEndpoint: "http://127.0.0.1:18791/health",
    skipProviderCheck: true,
  },
  {
    name: "anqr-symphony-integrator.service",
    shortName: "symphony-integrator",
    port: null,
    criticalFiles: ["harness/ops/orchestration/symphony-integrator.mjs"],
    healthEndpoint: null,
    skipProviderCheck: true,
  },
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 1;
    return {
      name: `anqr-symphony-executor@${n}.service`,
      shortName: `executor-wt${n}`,
      port: 4320 + n,
      criticalFiles: ["harness/ops/integrations/model/symphony-openai-bridge.mjs"],
      healthEndpoint: `http://127.0.0.1:${4320 + n}/health`,
      skipProviderCheck: false,
    };
  }),
];
