import { describe, it, expect } from "vitest";
import * as TestingContracts from "./index";

describe("testing-contracts index", () => {
  it("should export harness-bridge schemas", () => {
    expect(TestingContracts.symphonyModelsResponseSchema).toBeDefined();
    expect(TestingContracts.chatCompletionRequestSchema).toBeDefined();
    expect(TestingContracts.chatCompletionResponseSchema).toBeDefined();
    expect(TestingContracts.streamingChunkSchema).toBeDefined();
    expect(TestingContracts.healthResponseSchema).toBeDefined();
    expect(TestingContracts.metricsResponseSchema).toBeDefined();
    expect(TestingContracts.statsResponseSchema).toBeDefined();
    expect(TestingContracts.codebuffModelsResponseSchema).toBeDefined();
    expect(TestingContracts.codebuffHealthResponseSchema).toBeDefined();
    expect(TestingContracts.availableTools).toBeDefined();
  });

  it("should export validation functions", () => {
    expect(TestingContracts.validateContract).toBeDefined();
    expect(TestingContracts.validateStreamingContract).toBeDefined();
  });

  it("should export auto-testid functions", () => {
    expect(TestingContracts.initAutoDynamicTestIds).toBeDefined();
  });

  it("should export dynamic testid functions", () => {
    expect(TestingContracts.DynamicTestId).toBeDefined();
    expect(TestingContracts.useDynamicTestId).toBeDefined();
  });
});
