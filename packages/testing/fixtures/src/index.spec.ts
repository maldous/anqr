import { describe, it, expect } from "vitest";
import * as TestingFixtures from "./index";

describe("testing-fixtures index", () => {
  it("should export harness-scenarios exports", () => {
    expect(TestingFixtures.symphonyTestScenarios).toBeDefined();
    expect(TestingFixtures.codebuffTestScenarios).toBeDefined();
    expect(TestingFixtures.providerSelectionScenarios).toBeDefined();
    expect(TestingFixtures.expectedProviderOrder).toBeDefined();
    expect(TestingFixtures.openclawModelConfig).toBeDefined();
    expect(TestingFixtures.errorScenarios).toBeDefined();
    expect(TestingFixtures.expectedMetrics).toBeDefined();
    expect(TestingFixtures.creditGateScenarios).toBeDefined();
  });

  it("should export ReservedFixturesScaffold interface", () => {
    // TypeScript interface check - just verify the type exists
    const scaffold: TestingFixtures.ReservedFixturesScaffold = {
      __reservedFixturesScaffold: "reserved",
    };
    expect(scaffold.__reservedFixturesScaffold).toBe("reserved");
  });
});
