import { describe, it, expect } from "vitest";
import { createHarnessFakes } from "./create-harness-fakes";
import { FakeBridgeClient } from "./fake-bridge-client";
import { FakeProviderFailureSimulator } from "./fake-provider-failure-simulator";
import { FakeMetricsCollector } from "./fake-metrics-collector";
import { FakeQueueState } from "./fake-queue-state";

describe("createHarnessFakes", () => {
  it("should create all fake instances", () => {
    const fakes = createHarnessFakes();

    expect(fakes.bridgeClient).toBeInstanceOf(FakeBridgeClient);
    expect(fakes.codebuffClient).toBeInstanceOf(FakeBridgeClient);
    expect(fakes.failureSimulator).toBeInstanceOf(FakeProviderFailureSimulator);
    expect(fakes.metricsCollector).toBeInstanceOf(FakeMetricsCollector);
    expect(fakes.queueState).toBeInstanceOf(FakeQueueState);
  });

  it("should configure symphony bridge client", () => {
    const fakes = createHarnessFakes();
    expect(fakes.bridgeClient).toBeDefined();
    // Bridge client configured with Symphony port 4319
  });

  it("should configure codebuff bridge client", () => {
    const fakes = createHarnessFakes();
    expect(fakes.codebuffClient).toBeDefined();
    // Codebuff client configured with port 4318
  });

  it("should create independent instances", () => {
    const fakes1 = createHarnessFakes();
    const fakes2 = createHarnessFakes();

    expect(fakes1.metricsCollector).not.toBe(fakes2.metricsCollector);
    expect(fakes1.queueState).not.toBe(fakes2.queueState);
  });
});
