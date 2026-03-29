import { describe, it, expect } from "vitest";
import {
  symphonyTestScenarios,
  codebuffTestScenarios,
  providerSelectionScenarios,
  expectedProviderOrder,
  openclawModelConfig,
  errorScenarios,
  expectedMetrics,
  creditGateScenarios,
} from "./harness-scenarios";

describe("harness-scenarios", () => {
  describe("symphonyTestScenarios", () => {
    it("should have simplePrompt scenario", () => {
      expect(symphonyTestScenarios.simplePrompt).toMatchObject({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: expect.any(String) }),
        ]),
        model: "symphony/main",
        stream: false,
      });
    });

    it("should have codexModel scenario", () => {
      expect(symphonyTestScenarios.codexModel.model).toBe("symphony/codex");
    });

    it("should have groqFallback scenario", () => {
      expect(symphonyTestScenarios.groqFallback.model).toBe("symphony/groq");
    });

    it("should have streamingPrompt scenario", () => {
      expect(symphonyTestScenarios.streamingPrompt.stream).toBe(true);
    });

    it("should have withIssueContext scenario", () => {
      expect(symphonyTestScenarios.withIssueContext.messages[0].content).toContain("ANQR-747");
    });

    it("should have tool execution scenarios", () => {
      expect(symphonyTestScenarios.toolExecutionRead).toBeDefined();
      expect(symphonyTestScenarios.toolExecutionExec).toBeDefined();
      expect(symphonyTestScenarios.toolExecutionGlob).toBeDefined();
    });
  });

  describe("codebuffTestScenarios", () => {
    it("should have simplePrompt scenario", () => {
      expect(codebuffTestScenarios.simplePrompt.model).toBe("codebuff/base");
      expect(codebuffTestScenarios.simplePrompt.stream).toBe(false);
    });

    it("should have streamingPrompt scenario", () => {
      expect(codebuffTestScenarios.streamingPrompt.stream).toBe(true);
    });

    it("should have complexTask scenario with issue format", () => {
      expect(codebuffTestScenarios.complexTask.messages[0].content).toContain("## Issue:");
    });
  });

  describe("providerSelectionScenarios", () => {
    it("should have noRestrictions scenario", () => {
      expect(providerSelectionScenarios.noRestrictions.allowedNames).toBeNull();
      expect(providerSelectionScenarios.noRestrictions.excludeNames).toEqual([]);
    });

    it("should have codexOnly scenario", () => {
      expect(providerSelectionScenarios.codexOnly.allowedNames).toContain("codex");
    });

    it("should have excludeOllama scenario", () => {
      expect(providerSelectionScenarios.excludeOllama.excludeNames).toContain("ollama-local");
    });

    it("should have freeProvidersOnly scenario", () => {
      expect(providerSelectionScenarios.freeProvidersOnly.allowedNames).toContain("groq");
      expect(providerSelectionScenarios.freeProvidersOnly.allowedNames).toContain("gemini");
    });
  });

  describe("expectedProviderOrder", () => {
    it("should have codex as highest priority", () => {
      expect(expectedProviderOrder[0]).toBe("codex");
    });

    it("should have ollama-local as lowest priority", () => {
      expect(expectedProviderOrder[expectedProviderOrder.length - 1]).toBe("ollama-local");
    });

    it("should include common providers", () => {
      expect(expectedProviderOrder).toContain("codex");
      expect(expectedProviderOrder).toContain("groq");
      expect(expectedProviderOrder).toContain("gemini");
      expect(expectedProviderOrder).toContain("mistral");
    });
  });

  describe("openclawModelConfig", () => {
    it("should have primary model", () => {
      expect(openclawModelConfig.primaryModel).toBe("symphony-bridge/symphony/main");
    });

    it("should have fallback models", () => {
      expect(openclawModelConfig.fallbackModels).toBeInstanceOf(Array);
      expect(openclawModelConfig.fallbackModels.length).toBeGreaterThan(0);
    });

    it("should include codex as first fallback", () => {
      expect(openclawModelConfig.fallbackModels[0]).toBe("symphony-bridge/symphony/codex");
    });

    it("should include codebuff bridge as fallback", () => {
      expect(openclawModelConfig.fallbackModels).toContain("codebuff-bridge/codebuff/base");
    });
  });

  describe("errorScenarios", () => {
    it("should have noApiKey scenario", () => {
      expect(errorScenarios.noApiKey.expectedStatus).toBe(401);
      expect(errorScenarios.noApiKey.headers).toEqual({});
    });

    it("should have invalidModel scenario", () => {
      expect(errorScenarios.invalidModel.body?.model).toBe("non-existent-model");
    });

    it("should have malformedJson scenario", () => {
      expect(errorScenarios.malformedJson.expectedStatus).toBe(400);
      expect(errorScenarios.malformedJson.rawBody).toBeDefined();
    });

    it("should have emptyMessages scenario", () => {
      expect(errorScenarios.emptyMessages.body?.messages).toEqual([]);
    });

    it("should have oversizedBody scenario", () => {
      expect(errorScenarios.oversizedBody.expectedStatus).toBe(413);
      expect(errorScenarios.oversizedBody.body?.messages[0].content.length).toBeGreaterThan(
        1000000,
      );
    });
  });

  describe("expectedMetrics", () => {
    it("should have afterSingleRequest metrics", () => {
      expect(expectedMetrics.afterSingleRequest.totalRequests).toBe(1);
      expect(expectedMetrics.afterSingleRequest.totalFallbacks).toBe(0);
      expect(expectedMetrics.afterSingleRequest.totalErrors).toBe(0);
    });

    it("should have afterFallbackRequest metrics", () => {
      expect(expectedMetrics.afterFallbackRequest.totalRequests).toBe(1);
      expect(expectedMetrics.afterFallbackRequest.totalFallbacks).toBe(1);
    });

    it("should have afterError metrics", () => {
      expect(expectedMetrics.afterError.totalRequests).toBe(1);
      expect(expectedMetrics.afterError.totalErrors).toBe(1);
    });
  });

  describe("creditGateScenarios", () => {
    it("should have successAfterSelection scenario", () => {
      expect(creditGateScenarios.successAfterSelection.expectedSuccess).toBe(true);
      expect(creditGateScenarios.successAfterSelection.expectedProviderCount).toBe(1);
    });

    it("should have fallbackAfterFailure scenario", () => {
      expect(creditGateScenarios.fallbackAfterFailure.simulateFailure).toBe(true);
      expect(creditGateScenarios.fallbackAfterFailure.expectedFallbackCount).toBe(1);
    });

    it("should have cooldownAfterRepeatedFailures scenario", () => {
      expect(creditGateScenarios.cooldownAfterRepeatedFailures.failureCount).toBe(3);
      expect(creditGateScenarios.cooldownAfterRepeatedFailures.expectedCooldown).toBe(true);
    });
  });
});
