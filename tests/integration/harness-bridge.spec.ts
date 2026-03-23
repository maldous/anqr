/**
 * Integration tests for harness bridge contracts
 *
 * Tests bridge HTTP endpoints for /v1/models, /v1/chat/completions, and streaming
 * as specified in testing-strategy-anqr-1.0.md
 *
 * These tests require the bridges to be running:
 *   make symphony-bridge  # port 4319
 *   make codebuff-bridge  # port 4318
 *
 * Run: npx vitest run tests/integration/harness-bridge.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Inline fixtures to avoid workspace resolution issues in test context
const symphonyTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok' if you can read this." }],
    model: "symphony/main",
    stream: false,
  },
  codexModel: {
    messages: [{ role: "user" as const, content: "List the files in the current directory." }],
    model: "symphony/codex",
    stream: false,
  },
  groqFallback: {
    messages: [{ role: "user" as const, content: "What is 2 + 2?" }],
    model: "symphony/groq",
    stream: false,
  },
  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count from 1 to 5." }],
    model: "symphony/main",
    stream: true,
  },
  withIssueContext: {
    messages: [{ role: "user" as const, content: "## Issue: ANQR-747 — Test\nPlease write ok." }],
    model: "symphony/main",
    stream: false,
  },
};

const codebuffTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok'." }],
    model: "codebuff/base",
    stream: false,
  },
  streamingPrompt: {
    messages: [{ role: "user" as const, content: "Count to 3." }],
    model: "codebuff/base",
    stream: true,
  },
};

// Contract schemas (inlined to avoid workspace resolution)
import { z } from "zod";

const symphonyModelsResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(z.object({ id: z.string(), object: z.literal("model"), owned_by: z.string(), created: z.number() })),
});

const chatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({ index: z.number(), message: z.object({ role: z.literal("assistant"), content: z.string().nullable() }), finish_reason: z.string() })),
  usage: z.object({ prompt_tokens: z.number(), completion_tokens: z.number(), total_tokens: z.number() }),
  _symphony_provider: z.string().optional(),
  _symphony_attempts: z.number().optional(),
  _symphony_tried: z.array(z.string()).optional(),
  _symphony_duration_ms: z.number().optional(),
});

const streamingChunkSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  choices: z.array(z.object({ index: z.number(), delta: z.object({ role: z.string().optional(), content: z.string().nullable().optional() }), finish_reason: z.string().nullable() })),
});

const healthResponseSchema = z.object({
  status: z.string(),
  model: z.string(),
  providersConfigured: z.number().optional(),
  rankedProviders: z.array(z.object({ name: z.string(), score: z.number().nullable() })).optional(),
  tools: z.array(z.string()).optional(),
});

function validateStreamingContract(chunks: string[]) {
  const errors: string[] = [];
  let finalChunkFound = false;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] === "[DONE]") { finalChunkFound = true; continue; }
    const parsed = JSON.parse(chunks[i]);
    const result = streamingChunkSchema.safeParse(parsed);
    if (!result.success) errors.push(`Chunk ${i} validation failed: ${result.error.message}`);
  }
  return { valid: errors.length === 0, errors, finalChunkFound };
}

const SYMPHONY_BASE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319";
const CODEBUFF_BASE_URL = process.env.CODEBUFF_BRIDGE_URL || "http://127.0.0.1:4318";
const SYMPHONY_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const CODEBUFF_API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";

describe("Symphony Bridge Contract Tests", () => {
  const baseUrl = SYMPHONY_BASE_URL;
  const apiKey = SYMPHONY_API_KEY;

  describe("GET /v1/models", () => {
    it("should return valid models response", async () => {
      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Validate against contract schema
      const result = symphonyModelsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      // Should have at least one model
      expect(data.data.length).toBeGreaterThan(0);

      // Should include symphony/main
      const modelIds = data.data.map((m: { id: string }) => m.id);
      expect(modelIds).toContain("symphony/main");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await fetch(`${baseUrl}/health`);

      expect(res.status).toBe(200);
      const data = await res.json();

      const result = healthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(data.status).toBe("ok");
      expect(data.model).toBeTruthy();
    });

    it("should not require auth for health check", async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: { Authorization: "" },
      });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /v1/chat/completions - Non-streaming", () => {
    it("should complete simple prompt", async () => {
      const scenario = symphonyTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Validate response contract
      const result = chatCompletionResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      // Check Symphony extensions
      expect(data._symphony_provider).toBeDefined();
      expect(data._symphony_duration_ms).toBeDefined();

      // Should have content
      expect(data.choices[0].message.content).toBeTruthy();
    });

    it("should handle issue context in prompt", async () => {
      const scenario = symphonyTestScenarios.withIssueContext;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.choices[0].message.content).toBeTruthy();
    });

    it("should include provider attempts in response", async () => {
      const scenario = symphonyTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      const data = await res.json();

      // Should track attempts
      expect(data._symphony_attempts).toBeDefined();
      expect(data._symphony_tried).toBeDefined();
      expect(Array.isArray(data._symphony_tried)).toBe(true);
    });
  });

  describe("POST /v1/chat/completions - Streaming", () => {
    it("should stream response chunks", async () => {
      const scenario = symphonyTestScenarios.streamingPrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const chunks: string[] = [];
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                break;
              }
              chunks.push(data);
            }
          }
        }
      }

      expect(chunks.length).toBeGreaterThan(0);

      // Validate streaming chunks against contract
      const validation = validateStreamingContract(chunks);
      expect(validation.valid).toBe(true);
      expect(validation.finalChunkFound).toBe(true);
    });
  });

  describe("GET /v1/metrics", () => {
    it("should return bridge and credit-gate metrics", async () => {
      const res = await fetch(`${baseUrl}/v1/metrics`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.bridge).toBeDefined();
      expect(data.bridge.totalRequests).toBeDefined();
      expect(data.creditGate).toBeDefined();
    });
  });

  describe("GET /v1/stats", () => {
    it("should return ranked provider stats", async () => {
      const res = await fetch(`${baseUrl}/v1/stats`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.rankedProviders).toBeDefined();
      expect(data.providerStats).toBeDefined();
    });
  });

  describe("Error handling", () => {
    it("should reject unauthenticated requests", async () => {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify(symphonyTestScenarios.simplePrompt),
      });

      expect(res.status).toBe(401);
    });

    it("should handle malformed JSON", async () => {
      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: "{ not valid json",
      });

      expect(res.status).toBe(400);
    });
  });
});

describe("Codebuff Bridge Contract Tests", () => {
  const baseUrl = CODEBUFF_BASE_URL;
  const apiKey = CODEBUFF_API_KEY;

  describe("GET /v1/models", () => {
    it("should return valid codebuff model", async () => {
      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      const result = symphonyModelsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      const modelIds = data.data.map((m: { id: string }) => m.id);
      expect(modelIds).toContain("codebuff/base");
    });
  });

  describe("GET /health", () => {
    it("should return health status with account info", async () => {
      const res = await fetch(`${baseUrl}/health`);

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBeDefined();
      expect(data.model).toBe("codebuff/base");
      expect(data.apiKeysConfigured).toBeDefined();
      expect(data.paidAccounts).toBeDefined();
      expect(data.freeAccounts).toBeDefined();
    });
  });

  describe("POST /v1/chat/completions - Non-streaming", () => {
    it("should complete simple prompt", async () => {
      const scenario = codebuffTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      // May return 200 or error depending on API key availability
      if (res.status === 200) {
        const data = await res.json();
        expect(data.choices).toBeDefined();
        expect(data.choices[0].message.content).toBeTruthy();
      } else {
        // If no valid API keys, should return clear error
        const error = await res.json();
        expect(error.error).toBeDefined();
      }
    });
  });

  describe("POST /v1/chat/completions - Streaming", () => {
    it("should stream response", async () => {
      const scenario = codebuffTestScenarios.streamingPrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
      });

      // Either streaming works or returns error
      if (res.status === 200) {
        expect(res.headers.get("content-type")).toContain("text/event-stream");

        const chunks: string[] = [];
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  break;
                }
                chunks.push(data);
              }
            }
          }
        }

        expect(chunks.length).toBeGreaterThan(0);
      }
    });
  });
});

// Skip all tests if bridges are not running
const skipIfNoBridge = () => {
  // This is handled by the test structure - tests will fail if bridges unavailable
};

skipIfNoBridge();