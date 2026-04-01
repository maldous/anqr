import { FakeBridgeClient } from "./fake-bridge-client";
import { FakeProviderFailureSimulator } from "./fake-provider-failure-simulator";
import { FakeMetricsCollector } from "./fake-metrics-collector";
import { FakeQueueState } from "./fake-queue-state";

export function createHarnessFakes() {
  return {
    bridgeClient: new FakeBridgeClient({
      baseUrl: "http://127.0.0.1:4319/v1",
      apiKey: "local-symphony",
    }),
    // Standalone Codebuff bridge retired per ADR-0003 — Codebuff SDK runs inside Symphony bridges
    codebuffClient: new FakeBridgeClient({
      baseUrl: "http://127.0.0.1:4319/v1",
      apiKey: "local-symphony",
    }),
    failureSimulator: new FakeProviderFailureSimulator(),
    metricsCollector: new FakeMetricsCollector(),
    queueState: new FakeQueueState(),
  };
}
