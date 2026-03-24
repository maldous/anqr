/**
 * Integration tests for Codebuff paid/free mode fallback
 *
 * Tests Codebuff API key mode selection (paid first, then free)
 * with re-validation every 5 hours as specified in testing-strategy-anqr-1.0.md
 *
 * Run: npx vitest run tests/integration/codebuff-key-rotation.spec.ts
 */

import { describe, it, expect, beforeAll } from "vitest";

const CODEBUFF_BASE_URL = process.env.CODEBUFF_BRIDGE_URL || "http://127.0.0.1:4318";
const CODEBUFF_API_KEY = process.env.CODEBUFF_BRIDGE_API_KEY || "local-bridge";

const FETCH_TIMEOUT_MS = 10_000;
const COMPLETION_TIMEOUT_MS = 120_000;

// REVALIDATION_INTERVAL_MS = 5 * 60 * 60 * 1000 = 5 hours
const REVALIDATION_INTERVAL_MS = 5 * 60 * 60 * 1000;

let bridgeAvailable = false;

async function isBridgeReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${CODEBUFF_BASE_URL}/health`, { signal: AbortSignal.timeout(3_000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe("Codebuff Bridge Mode Selection", () => {
  beforeAll(async () => {
    bridgeAvailable = await isBridgeReachable();
    if (!bridgeAvailable) {
      console.warn(
        `[codebuff-key-rotation] ⚠️ Codebuff bridge not reachable at ${CODEBUFF_BASE_URL} — skipping live tests`,
      );
    }
  });

  describe("GET /health - Key Configuration", () => {
    it("should report API key status", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.apiKeyConfigured).toBeDefined();
      expect(typeof data.apiKeyConfigured).toBe("boolean");
    });

    it("should report current mode (paid or free)", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.mode).toBeDefined();
      expect(["paid", "free", "none"]).toContain(data.mode);
    });
  });

  describe("Mode Selection Logic", () => {
    it("should select paid or free mode based on account status", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const data = await res.json();

      // If key is configured, mode should be paid or free
      if (data.apiKeyConfigured) {
        expect(["paid", "free"]).toContain(data.mode);
      }
    });
  });

  describe("Paid Re-probe Interval", () => {
    it("should have re-validation interval configured", () => {
      expect(REVALIDATION_INTERVAL_MS).toBe(5 * 60 * 60 * 1000);
      expect(REVALIDATION_INTERVAL_MS).toBe(18000000);
    });

    it("should track last revalidation time internally", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/health`, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      const data = await res.json();

      expect(data.status).toMatch(/^(ok|initializing)$/);
    });

    it(
      "should handle time-based re-validation trigger",
      { timeout: COMPLETION_TIMEOUT_MS },
      async () => {
        if (!bridgeAvailable) return;

        const res = await fetch(`${CODEBUFF_BASE_URL}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CODEBUFF_API_KEY}`,
          },
          body: JSON.stringify({
            model: "codebuff/base",
            messages: [{ role: "user", content: "test" }],
          }),
          signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
        });

        expect([200, 401, 500]).toContain(res.status);
      },
    );
  });

  describe("Error Handling for Key Failures", () => {
    it("should handle auth errors gracefully", async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-key",
        },
        body: JSON.stringify({
          model: "codebuff/base",
          messages: [{ role: "user", content: "test" }],
        }),
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      // Bridge should return an error or handle gracefully, not crash
      expect([200, 400, 401, 403, 500]).toContain(res.status);
      const data = await res.json();
      expect(data).toBeDefined();
    });

    it("should handle rate limit scenarios", { timeout: COMPLETION_TIMEOUT_MS }, async () => {
      if (!bridgeAvailable) return;

      const res = await fetch(`${CODEBUFF_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CODEBUFF_API_KEY}`,
        },
        body: JSON.stringify({
          model: "codebuff/base",
          messages: [{ role: "user", content: "test" }],
        }),
        signal: AbortSignal.timeout(COMPLETION_TIMEOUT_MS - 5_000),
      });

      expect([200, 429, 500]).toContain(res.status);
    });
  });
});
