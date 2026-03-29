import { describe, it, expect } from "vitest";
import * as TestingFakes from "./index";

describe("testing-fakes index", () => {
  it("should export harness-adapters exports", () => {
    expect(TestingFakes.FakeBridgeClient).toBeDefined();
    expect(TestingFakes.FakeProviderFailureSimulator).toBeDefined();
    expect(TestingFakes.FakeMetricsCollector).toBeDefined();
    expect(TestingFakes.FakeQueueState).toBeDefined();
    expect(TestingFakes.createHarnessFakes).toBeDefined();
  });

  it("should export ReservedFakesScaffold interface", () => {
    // TypeScript interface check - just verify the type exists
    const scaffold: TestingFakes.ReservedFakesScaffold = {
      __reservedFakesScaffold: "reserved",
    };
    expect(scaffold.__reservedFakesScaffold).toBe("reserved");
  });
});
