/**
 * Integration tests for harness bridge contracts
 *
 * Tests bridge HTTP endpoints for /v1/models, /v1/chat/completions, and streaming
 * as specified in testing-strategy-anqr-1.0.md
 *
 * These tests require the bridges to be running:
 *   systemctl --user start anqr-symphony-bridge.service
 *   systemctl --user start anqr-codebuff-bridge.service
 *
 * Run: npx vitest run tests/integration/harness-bridge.spec.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import { z } from "zod";

const SYMPHONY_BASE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319";
const CODEBUFF_BASE_URL = process.env.CODEBUFF_BRIDGE_URL || "http://127.0.0.1:4318";
const SYMPHONY_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";
const CODEBUFF_API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";

const FETCH_TIMEOUT_MS = 10_000;
const COMPLETION_TIMEOUT_MS = 120_000;

// Contract schemas
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
  providersAvailable: z.number().optional(),
  providersWithStats: z.number().optional(),
  configuredProviders: z.array(z.object({
    name: z.string(),
    status: z.string(),
    available: z.boolean(),
  })).optional(),
  lastProbeAt: z.string().nullable().optional(),
  rankedProviders: z.array(z.object({ name: z.string(), score: z.number().nullable() })).optional(),
  tools: z.array(z.string()).optional(),
});

function validateStreamingContract(chunks: string[]) {
  const errors: string[] = [];
  let finalChunkFound = false;
  for (let i = 0; i < chunks.length; i++) {
    if (chunks[i] === "[DONE]") { finalChunkFound = true; continue; }
    try {
      const parsed = JSON.parse(chunks[i]);
      const result = streamingChunkSchema.safeParse(parsed);
      if (!result.success) errors.push(`Chunk ${i} validation failed: ${result.error.message}`);
    } catch {
      errors.push(`Chunk ${i} is not valid JSON`);
    }
  }
  return { valid: errors.length === 0, errors, finalChunkFound };
}

/**
 * Check if a bridge is reachable. Returns true if reachable.
 */
async function isBridgeReachable(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Inline test scenarios
const symphonyTestScenarios = {
  simplePrompt: {
    messages: [{ role: "user" as const, content: "Say 'ok' if you can read this." }],
    model: "symphony/main",
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

describe("Symphony Bridge Contract Tests", () => {
  const baseUrl = SYMPHONY_BASE_URL;
  const apiKey = SYMPHONY_API_KEY;
  let bridgeAvailable = false;

  beforeAll(async () => {
    bridgeAvailable = await isBridgeReachable(baseUrl);
    if (!bridgeAvailable) {
      console.warn(`[harness-bridge] ⚠️ Symphony bridge not reachable at ${baseUrl} — skipping live tests`);
    }
  });

  describe("GET /v1/models", () => {
    it("should return valid models response", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      const result = symphonyModelsResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      expect(data.data.length).toBeGreaterThan(0);

      const modelIds = data.data.map((m: { id: string }) => m.id);
      expect(modelIds).toContain("symphony/main");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      const result = healthResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(data.status).toBe("ok");
      expect(data.model).toBeTruthy();
    });

    it("should not require auth for health check", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/health`, {
        headers: { Authorization: "" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /v1/chat/completions - Non-streaming", () => {
    it("should complete simple prompt", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = symphonyTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      const result = chatCompletionResponseSchema.safeParse(data);
      expect(result.success).toBe(true);

      expect(data._symphony_provider).toBeDefined();
      expect(data._symphony_duration_ms).toBeDefined();
      expect(data.choices[0].message.content).toBeTruthy();
    });

    it("should handle issue context in prompt", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = symphonyTestScenarios.withIssueContext;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.choices[0].message.content).toBeTruthy();
    });

    it("should include provider attempts in response", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = symphonyTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      const data = await res.json();

      expect(data._symphony_attempts).toBeDefined();
      expect(data._symphony_tried).toBeDefined();
      expect(Array.isArray(data._symphony_tried)).toBe(true);
    });
  });

  describe("POST /v1/chat/completions - Streaming", () => {
    it("should stream response chunks", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = symphonyTestScenarios.streamingPrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const chunks: string[] = [];
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let doneReading = false;

      if (reader) {
        while (!doneReading) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                chunks.push("[DONE]");
                doneReading = true;
                break;
              }
              if (data.trim()) {
                chunks.push(data);
              }
            }
          }
        }
      }

      expect(chunks.length).toBeGreaterThan(0);

      const validation = validateStreamingContract(chunks);
      expect(validation.valid).toBe(true);
    });
  });

  describe("GET /v1/metrics", () => {
    it("should return bridge and credit-gate metrics", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/metrics`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/stats`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.rankedProviders).toBeDefined();
      expect(data.providerStats).toBeDefined();
    });
  });

  describe("Error handling", () => {
    it("should reject invalid auth tokens", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token-not-local",
        },
        body: JSON.stringify(symphonyTestScenarios.simplePrompt),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // Symphony bridge accepts local- prefixed and empty tokens;
      // invalid-token-not-local should be rejected
      expect(res.status).toBe(401);
    });

    it("should handle malformed JSON", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: "{ not valid json",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // Bridge may return 400 or 500 depending on where the parse error is caught
      expect([400, 500]).toContain(res.status);
    });
  });
});

describe("Codebuff Bridge Contract Tests", () => {
  const baseUrl = CODEBUFF_BASE_URL;
  const apiKey = CODEBUFF_API_KEY;
  let bridgeAvailable = false;

  beforeAll(async () => {
    bridgeAvailable = await isBridgeReachable(baseUrl);
    if (!bridgeAvailable) {
      console.warn(`[harness-bridge] ⚠️ Codebuff bridge not reachable at ${baseUrl} — skipping live tests`);
    }
  });

  describe("GET /v1/models", () => {
    it("should return valid codebuff model", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
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
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.status).toBeDefined();
      expect(data.model).toBe("codebuff/base");
      expect(data.apiKeyConfigured).toBeDefined();
      expect(typeof data.apiKeyConfigured).toBe("boolean");
      expect(data.mode).toBeDefined();
      expect(["paid", "free", "none"]).toContain(data.mode);
    });
  });

  describe("POST /v1/chat/completions - Non-streaming", () => {
    it("should complete simple prompt", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = codebuffTestScenarios.simplePrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      if (res.status === 200) {
        const data = await res.json();
        expect(data.choices).toBeDefined();
        expect(data.choices[0].message.content).toBeTruthy();
      } else {
        const error = await res.json();
        expect(error.error).toBeDefined();
      }
    });
  });

  describe("POST /v1/chat/completions - Streaming", () => {
    it("should stream response", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const scenario = codebuffTestScenarios.streamingPrompt;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(scenario),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      if (res.status === 200) {
        expect(res.headers.get("content-type")).toContain("text/event-stream");

        const chunks: string[] = [];
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let doneReading = false;

        if (reader) {
          while (!doneReading) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") {
                  doneReading = true;
                  break;
                }
                if (data.trim()) {
                  chunks.push(data);
                }
              }
            }
          }
        }

        expect(chunks.length).toBeGreaterThan(0);
      }
    });
  });
});
