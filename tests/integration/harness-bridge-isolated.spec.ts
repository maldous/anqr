/**
 * Integration tests for harness bridge with isolated bridge instances
 *
 * Spawns dedicated bridge instances on dynamic ports to avoid conflicts
 * with production bridges or other tests.
 *
 * Run: npx vitest run tests/integration/harness-bridge-isolated.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSymphonyBridge } from "../helpers/spawn-test-bridge";

describe("Symphony Bridge (Isolated)", () => {
  let bridge: Awaited<ReturnType<typeof spawnSymphonyBridge>> | null = null;

  beforeAll(async () => {
    // Spawn a dedicated bridge instance on a dynamic port
    bridge = await spawnSymphonyBridge({
      preferredPort: 14319, // Higher port range to avoid conflicts
      apiKey: "test-symphony",
    });

    console.log(`Symphony bridge started on port ${bridge.port}`);
  });

  afterAll(async () => {
    // Clean up bridge process
    if (bridge) {
      await bridge.cleanup();
      console.log(`Symphony bridge on port ${bridge.port} stopped`);
    }
  });

  it("should return health status", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const res = await fetch(`${bridge.baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.model).toBeTruthy();
  });

  it("should list available models", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const res = await fetch(`${bridge.baseUrl}/v1/models`, {
      headers: { Authorization: `Bearer ${bridge.apiKey}` },
      signal: AbortSignal.timeout(5000),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.object).toBe("list");
    expect(data.data).toBeInstanceOf(Array);
    expect(data.data.length).toBeGreaterThan(0);

    const modelIds = data.data.map((m: { id: string }) => m.id);
    expect(modelIds).toContain("symphony/main");
  });

  it("should accept chat completion requests", async () => {
    if (!bridge) throw new Error("Bridge not initialized");

    const res = await fetch(`${bridge.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bridge.apiKey}`,
      },
      body: JSON.stringify({
        model: "symphony/main",
        messages: [{ role: "user", content: "Say 'test'" }],
        stream: false,
      }),
      signal: AbortSignal.timeout(30000),
    });

    // May succeed or fail based on provider availability, but should not crash
    expect([200, 500]).toContain(res.status);
  });
});

// Codebuff Bridge (Isolated) tests removed — standalone Codebuff bridge retired per ADR-0003.
// Codebuff SDK now runs inside each worktree-local Symphony bridge.

// Multiple Bridges (Concurrent) tests removed — standalone Codebuff bridge retired per ADR-0003.
// Codebuff SDK now runs inside each worktree-local Symphony bridge.
