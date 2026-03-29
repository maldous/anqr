import { describe, it, expect } from "vitest";
import {
  symphonyModelsResponseSchema,
  chatCompletionRequestSchema,
  chatCompletionResponseSchema,
  streamingChunkSchema,
  healthResponseSchema,
  metricsResponseSchema,
  statsResponseSchema,
  codebuffModelsResponseSchema,
  codebuffHealthResponseSchema,
  availableTools,
} from "./harness-bridge";

describe("harness-bridge schemas", () => {
  describe("symphonyModelsResponseSchema", () => {
    it("should validate valid models response", () => {
      const data = {
        object: "list",
        data: [
          { id: "model-1", object: "model", owned_by: "anqr", created: 1234567890 },
          { id: "model-2", object: "model", owned_by: "anqr", created: 1234567891 },
        ],
      };

      const result = symphonyModelsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid object type", () => {
      const data = {
        object: "invalid",
        data: [{ id: "model-1", object: "model", owned_by: "anqr", created: 1234567890 }],
      };

      const result = symphonyModelsResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("chatCompletionRequestSchema", () => {
    it("should validate minimal valid request", () => {
      const data = {
        messages: [{ role: "user", content: "test" }],
      };

      const result = chatCompletionRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate request with all optional fields", () => {
      const data = {
        model: "test-model",
        messages: [{ role: "user", content: "test", name: "user1" }],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 100,
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "test_tool",
              description: "A test tool",
              parameters: { type: "object" },
            },
          },
        ],
      };

      const result = chatCompletionRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept array content", () => {
      const data = {
        messages: [{ role: "user", content: [{ type: "text", text: "test" }] }],
      };

      const result = chatCompletionRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const data = {
        messages: [{ role: "invalid", content: "test" }],
      };

      const result = chatCompletionRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject temperature out of range", () => {
      const data = {
        messages: [{ role: "user", content: "test" }],
        temperature: 3.0, // max is 2
      };

      const result = chatCompletionRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe("chatCompletionResponseSchema", () => {
    it("should validate complete response with symphony extensions", () => {
      const data = {
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "response" },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
        _symphony_provider: "codex",
        _symphony_attempts: 2,
        _symphony_tried: ["ollama-local", "codex"],
        _symphony_duration_ms: 1500,
      };

      const result = chatCompletionResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept null content", () => {
      const data = {
        id: "chatcmpl-123",
        object: "chat.completion",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: null },
            finish_reason: "length",
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      };

      const result = chatCompletionResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("streamingChunkSchema", () => {
    it("should validate streaming chunk", () => {
      const data = {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [
          {
            index: 0,
            delta: { role: "assistant", content: "test" },
            finish_reason: null,
          },
        ],
      };

      const result = streamingChunkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate chunk with empty delta", () => {
      const data = {
        id: "chatcmpl-123",
        object: "chat.completion.chunk",
        created: 1234567890,
        model: "test-model",
        choices: [{ index: 0, delta: {}, finish_reason: null }],
      };

      const result = streamingChunkSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("healthResponseSchema", () => {
    it("should validate minimal health response", () => {
      const data = {
        status: "healthy",
        model: "symphony/main",
      };

      const result = healthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should validate full health response", () => {
      const data = {
        status: "healthy",
        model: "symphony/main",
        providersConfigured: 5,
        providersAvailable: 4,
        providersWithStats: 3,
        configuredProviders: [
          { name: "codex", status: "available", available: true },
          { name: "groq", status: "available", available: true },
        ],
        lastProbeAt: "2024-01-01T00:00:00Z",
        rankedProviders: [
          { name: "codex", score: 0.95 },
          { name: "groq", score: 0.85 },
        ],
        tools: ["exec", "read", "glob"],
      };

      const result = healthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("metricsResponseSchema", () => {
    it("should validate metrics response", () => {
      const data = {
        bridge: {
          totalRequests: 100,
          streamingRequests: 50,
          nonStreamingRequests: 50,
          totalFallbacks: 5,
          totalErrors: 2,
          avgResponseTimeMs: 1500,
          minResponseTimeMs: 500,
          maxResponseTimeMs: 3000,
          totalTokensIn: 10000,
          totalTokensOut: 5000,
          totalToolCalls: 25,
          requestsByProvider: { codex: 60, groq: 40 },
          errorsByType: { timeout: 1, rate_limit: 1 },
          uptimeSeconds: 86400,
        },
        creditGate: {},
      };

      const result = metricsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should accept null min/max response times", () => {
      const data = {
        bridge: {
          totalRequests: 0,
          streamingRequests: 0,
          nonStreamingRequests: 0,
          totalFallbacks: 0,
          totalErrors: 0,
          avgResponseTimeMs: 0,
          minResponseTimeMs: null,
          maxResponseTimeMs: null,
          totalTokensIn: 0,
          totalTokensOut: 0,
          totalToolCalls: 0,
          requestsByProvider: {},
          errorsByType: {},
        },
        creditGate: {},
      };

      const result = metricsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("statsResponseSchema", () => {
    it("should validate stats response", () => {
      const data = {
        rankedProviders: [
          { name: "codex", score: 0.95, rank: 1 },
          { name: "groq", score: 0.85, rank: 2 },
          { name: "ollama-local", score: null, rank: 3 },
        ],
        providerStats: {
          codex: { requests: 50, errors: 0 },
          groq: { requests: 30, errors: 1 },
        },
      };

      const result = statsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("codebuffHealthResponseSchema", () => {
    it("should validate codebuff health response", () => {
      const data = {
        status: "healthy",
        model: "codebuff/base",
        apiKeysConfigured: 3,
        paidAccounts: 2,
        freeAccounts: 1,
      };

      const result = codebuffHealthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("codebuffModelsResponseSchema", () => {
    it("should be same as symphony schema", () => {
      expect(codebuffModelsResponseSchema).toBe(symphonyModelsResponseSchema);
    });
  });

  describe("availableTools", () => {
    it("should export expected tool names", () => {
      expect(availableTools).toContain("exec");
      expect(availableTools).toContain("read");
      expect(availableTools).toContain("glob");
      expect(availableTools).toHaveLength(3);
    });
  });
});
