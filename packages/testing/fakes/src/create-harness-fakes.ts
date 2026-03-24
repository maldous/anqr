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
    codebuffClient: new FakeBridgeClient({
      baseUrl: "http://127.0.0.1:4318/v1",
      apiKey: "local-bridge",
    }),
    failureSimulator: new FakeProviderFailureSimulator(),
    metricsCollector: new FakeMetricsCollector(),
    queueState: new FakeQueueState(),
  };
}
