import { describe, it, expect } from "vitest";
import {
  FakeBridgeClient,
  FakeProviderFailureSimulator,
  FakeMetricsCollector,
  FakeQueueState,
  createHarnessFakes,
} from "./harness-adapters";

describe("harness-adapters", () => {
  it("should export FakeBridgeClient", () => {
    expect(FakeBridgeClient).toBeDefined();
    const client = new FakeBridgeClient({
      baseUrl: "http://test",
      apiKey: "test-key",
    });
    expect(client).toBeInstanceOf(FakeBridgeClient);
  });

  it("should export FakeProviderFailureSimulator", () => {
    expect(FakeProviderFailureSimulator).toBeDefined();
    const simulator = new FakeProviderFailureSimulator();
    expect(simulator).toBeInstanceOf(FakeProviderFailureSimulator);
  });

  it("should export FakeMetricsCollector", () => {
    expect(FakeMetricsCollector).toBeDefined();
    const collector = new FakeMetricsCollector();
    expect(collector).toBeInstanceOf(FakeMetricsCollector);
  });

  it("should export FakeQueueState", () => {
    expect(FakeQueueState).toBeDefined();
    const queue = new FakeQueueState();
    expect(queue).toBeInstanceOf(FakeQueueState);
  });

  it("should export createHarnessFakes", () => {
    expect(createHarnessFakes).toBeDefined();
    const fakes = createHarnessFakes();
    expect(fakes.bridgeClient).toBeInstanceOf(FakeBridgeClient);
    expect(fakes.codebuffClient).toBeInstanceOf(FakeBridgeClient);
    expect(fakes.failureSimulator).toBeInstanceOf(FakeProviderFailureSimulator);
    expect(fakes.metricsCollector).toBeInstanceOf(FakeMetricsCollector);
    expect(fakes.queueState).toBeInstanceOf(FakeQueueState);
  });
});
