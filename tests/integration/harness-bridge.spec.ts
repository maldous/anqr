/**
 * Integration tests for harness bridge contracts
 *
 * Tests bridge HTTP endpoints for /v1/models, /v1/chat/completions, and streaming
 * as specified in testing-strategy-anqr-1.0.md
 *
 * These tests require the bridges to be running:
 *   systemctl --user start anqr-symphony-bridge.service
 *
 * Run: npx vitest run tests/integration/harness-bridge.spec.ts
 */

import { describe, it, expect, beforeAll } from "vitest";
import { z } from "zod";
import { validateStreamingContract } from "./harness-bridge-validate-streaming";
import { isBridgeReachable } from "./harness-bridge-check";
import { symphonyTestScenarios } from "./harness-bridge-scenarios";
// codebuffTestScenarios removed — standalone Codebuff bridge retired per ADR-0003

const SYMPHONY_BASE_URL = process.env.SYMPHONY_BRIDGE_URL || "http://127.0.0.1:4319";
const SYMPHONY_API_KEY = process.env.SYMPHONY_BRIDGE_API_KEY || "local-symphony";

const FETCH_TIMEOUT_MS = 5_000;
const COMPLETION_TIMEOUT_MS = 120_000;

// Contract schemas
const symphonyModelsResponseSchema = z.object({
  object: z.literal("list"),
  data: z.array(
    z.object({
      id: z.string(),
      object: z.literal("model"),
      owned_by: z.string(),
      created: z.number(),
    }),
  ),
});

const chatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal("chat.completion"),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({ role: z.literal("assistant"), content: z.string().nullable() }),
      finish_reason: z.string(),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
  _symphony_provider: z.string().optional(),
  _symphony_attempts: z.number().optional(),
  _symphony_tried: z.array(z.string()).optional(),
  _symphony_duration_ms: z.number().optional(),
});

// Health schema accepts both direct bridge and router responses.
// Direct bridge returns model, providersConfigured, etc.
// Router returns role, worktrees, activeRequests, etc.
const healthResponseSchema = z.object({
  status: z.string(),
  // Direct bridge fields
  model: z.string().optional(),
  providersConfigured: z.number().optional(),
  providersAvailable: z.number().optional(),
  providersWithStats: z.number().optional(),
  configuredProviders: z
    .array(
      z.object({
        name: z.string(),
        status: z.string(),
        available: z.boolean(),
      }),
    )
    .optional(),
  lastProbeAt: z.string().nullable().optional(),
  rankedProviders: z.array(z.object({ name: z.string(), score: z.number().nullable() })).optional(),
  tools: z.array(z.string()).optional(),
  // Router fields
  role: z.string().optional(),
  activeRequests: z.number().optional(),
  maxConcurrent: z.number().optional(),
  queueLength: z.number().optional(),
  worktrees: z.array(z.object({ id: z.string(), port: z.number() }).passthrough()).optional(),
});

describe("Symphony Bridge Contract Tests", () => {
  const baseUrl = SYMPHONY_BASE_URL;
  const apiKey = SYMPHONY_API_KEY;
  let bridgeAvailable = false;
  let isRouter = false;

  beforeAll(async () => {
    bridgeAvailable = await isBridgeReachable(baseUrl);
    if (!bridgeAvailable) {
      console.warn(
        `[harness-bridge] ⚠️ Symphony bridge not reachable at ${baseUrl} — skipping live tests`,
      );
      return;
    }
    // Detect if the endpoint is the symphony-agent-router (not a direct bridge).
    // The router proxies /v1/models and /v1/chat/completions but does not serve
    // bridge-specific endpoints like /v1/metrics and /v1/stats.
    try {
      const healthRes = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        isRouter = healthData.role === "symphony-agent-router";
        if (isRouter) {
          console.warn(
            `[harness-bridge] ℹ️ Detected symphony-agent-router — bridge-specific endpoint tests will be skipped`,
          );
        }
      }
    } catch {}
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
      // Direct bridge provides model; router provides role
      if (!isRouter) {
        expect(data.model).toBeTruthy();
      } else {
        expect(data.role).toBe("symphony-agent-router");
      }
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

    it(
      "should include provider attempts in response",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
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
      },
    );
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
      if (!bridgeAvailable || isRouter) return;

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
      if (!bridgeAvailable || isRouter) return;

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

    it("should reject request with empty messages array", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model: "symphony/main", messages: [] }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(data.error.type).toBe("invalid_request_error");
    });

    it(
      "should accept request with missing model field (defaults to symphony/main)",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ messages: [{ role: "user", content: "test" }] }),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        // Bridge accepts missing model and defaults to symphony/main - should succeed
        expect(res.status).toBe(200);
      },
    );

    it(
      "should accept request to unknown model route (routes to symphony/main)",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "symphony/nonexistent-route-xyz",
            messages: [{ role: "user", content: "test" }],
          }),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        // Bridge routes unknown models to symphony/main fallback - should succeed
        expect(res.status).toBe(200);
      },
    );

    it("should reject request with no body", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // parseBody resolves to {} for empty body, which means empty messages array
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it(
      "should handle request with missing Content-Type",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        // May succeed (some servers infer JSON) or fail — must not crash
        expect([200, 400, 415, 500]).toContain(res.status);
      },
    );
  });

  describe("Auth posture", () => {
    it(
      "should accept request with no Authorization header (local mode)",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        // Bridge accepts empty auth as valid in local mode - should succeed
        expect(res.status).toBe(200);
      },
    );

    it(
      "should accept local-prefixed tokens on completions",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer local-test-token",
          },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        expect(res.status, "local-prefixed token should not be rejected as unauthorized").not.toBe(
          401,
        );
        expect(res.status, "local-prefixed token should not be rejected as forbidden").not.toBe(
          403,
        );
      },
    );

    it("should reject non-local Bearer tokens on completions", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer definitely-not-a-local-token",
        },
        body: JSON.stringify(symphonyTestScenarios.simplePrompt),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(401);
    });

    it("should reject empty Bearer token on completions", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer ",
        },
        body: JSON.stringify(symphonyTestScenarios.simplePrompt),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // Empty bearer should be rejected or treated as anonymous
      expect([401, 403]).toContain(res.status);
    });
  });

  describe("Secret redaction in error responses", () => {
    const API_KEY_PATTERNS = [
      /sk-[a-zA-Z0-9]{20,}/,
      /gsk_[a-zA-Z0-9]{20,}/,
      /key-[a-zA-Z0-9]{20,}/,
      /GROQ_TOKEN/,
      /MISTRAL_TOKEN/,
      /GEMINI_TOKEN/,
      /SAMBANOVA_TOKEN/,
      /CEREBRAS_TOKEN/,
      /OPENROUTER_TOKEN/,
      /CODEBUFF_API_KEY/,
    ];

    it(
      "should not leak API keys in error responses for invalid route",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "symphony/nonexistent",
            messages: [{ role: "user", content: "test" }],
          }),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        // Bridge routes to symphony/main fallback, so this should succeed
        // Check the response doesn't leak secrets regardless of status
        const body = await res.text();
        for (const pattern of API_KEY_PATTERNS) {
          expect(body, `Response leaks secret matching ${pattern}`).not.toMatch(pattern);
        }
      },
    );

    it("should not leak API keys in error responses for malformed input", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: "{ broken json with secret probe",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      const body = await res.text();
      for (const pattern of API_KEY_PATTERNS) {
        expect(body, `Malformed-input error leaks secret matching ${pattern}`).not.toMatch(pattern);
      }
    });
  });

  describe("Metrics increment verification", () => {
    it(
      "should increment totalRequests after a completion",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable || isRouter) return;

        const before = await fetch(`${baseUrl}/v1/metrics`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        expect(before.status).toBe(200);
        const metricsBefore = await before.json();
        const totalBefore = metricsBefore.bridge?.totalRequests ?? 0;

        await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        const after = await fetch(`${baseUrl}/v1/metrics`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        expect(after.status).toBe(200);
        const metricsAfter = await after.json();
        const totalAfter = metricsAfter.bridge?.totalRequests ?? 0;

        expect(
          totalAfter,
          `totalRequests should increase: before=${totalBefore}, after=${totalAfter}`,
        ).toBeGreaterThan(totalBefore);
      },
    );
  });

  describe("Provider cooldown and recovery", () => {
    it(
      "should track provider usage in stats after completion",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable || isRouter) return;

        await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        const statsRes = await fetch(`${baseUrl}/v1/stats`, {
          headers: { Authorization: `Bearer ${apiKey}` },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });
        expect(statsRes.status).toBe(200);
        const stats = await statsRes.json();

        expect(stats.providerStats).toBeDefined();
        const trackedProviders = Object.keys(stats.providerStats);
        expect(
          trackedProviders.length,
          "At least one provider should be tracked in stats",
        ).toBeGreaterThan(0);

        const hasSuccessMetric = trackedProviders.some((name) => {
          const ps = stats.providerStats[name];
          return (ps.successes ?? 0) > 0 || (ps.totalRequests ?? 0) > 0;
        });
        expect(hasSuccessMetric, "At least one provider should have recorded a success").toBe(true);
      },
    );

    it(
      "should recover and serve requests after error-inducing input",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: "{ invalid json to trigger error path",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        });

        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(symphonyTestScenarios.simplePrompt),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.choices).toBeDefined();
        expect(typeof data.choices[0].message.content).toBe("string");
      },
    );
  });
});

// Standalone Codebuff Bridge Contract Tests removed — bridge retired per ADR-0003.
// Codebuff SDK now runs inside each worktree-local Symphony bridge.
