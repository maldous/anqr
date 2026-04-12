/**
 * E2E: Symphony router queue management & integration pipeline
 *
 * These tests hit the LIVE symphony router (port 4319) over HTTP to
 * verify queue management, the Linear trigger endpoint, and the overall
 * orchestration layer.
 *
 * Prerequisites: anqr-symphony-router, anqr-symphony-integrator, and
 * at least one anqr-symphony-executor@N must be running.
 *
 * Run: npx vitest run tests/e2e/integration-promotion.spec.ts --config vitest.e2e.config.ts
 */

import { describe, it, expect } from "vitest";
import {
  SYMPHONY_ROUTER_URL,
  LINEAR_WEBHOOK_URL,
  DISCORD_ROUTER_URL,
  assertServiceHealthy,
} from "./e2e-helpers.ts";

describe("Symphony router — live runtime", () => {
  it("health endpoint returns ok with all 8 worktrees", async () => {
    const body = await assertServiceHealthy(SYMPHONY_ROUTER_URL);
    expect(body.status).toBe("ok");
    expect(body.role).toBe("symphony-agent-router");
    expect(body.maxConcurrent).toBe(8);

    const worktrees = body.worktrees as Array<{
      id: string;
      port: number;
      activeRequests: number;
      failures: number;
    }>;
    expect(worktrees).toHaveLength(8);

    const ids = worktrees.map((w) => w.id);
    for (let i = 1; i <= 8; i++) {
      expect(ids).toContain(`wt${i}`);
    }
  });

  it("worktree ports are correct (4321-4328)", async () => {
    const body = await assertServiceHealthy(SYMPHONY_ROUTER_URL);
    const worktrees = body.worktrees as Array<{ id: string; port: number }>;
    for (const wt of worktrees) {
      const num = parseInt(wt.id.replace("wt", ""), 10);
      expect(wt.port).toBe(4320 + num);
    }
  });
});

describe("Symphony router — queue management", () => {
  it("GET /v1/linear/queue returns queue state", async () => {
    const res = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/queue`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.queueLength).toBe("number");
    expect(Array.isArray(body.events)).toBe(true);
  });

  it("POST + GET + DELETE queue round-trip works", async () => {
    const testEvent = {
      event: { identifier: `E2E-Q-${Date.now()}`, action: "test" },
    };

    // Enqueue
    const postRes = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testEvent),
    });
    expect(postRes.status).toBe(202);
    const postBody = await postRes.json();
    expect(postBody.status).toBe("queued");

    // Verify it appears in the queue
    const getRes = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/queue`);
    const getBody = await getRes.json();
    expect(getBody.queueLength).toBeGreaterThan(0);
    const found = getBody.events.some(
      (e: { identifier: string }) => e.identifier === testEvent.event.identifier,
    );
    expect(found).toBe(true);

    // Clear the queue
    const delRes = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/queue`, {
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);
    const delBody = await delRes.json();
    expect(delBody.status).toBe("cleared");
    expect(delBody.clearedCount).toBeGreaterThan(0);

    // Verify queue is empty
    const emptyRes = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/queue`);
    const emptyBody = await emptyRes.json();
    expect(emptyBody.queueLength).toBe(0);
  });
});

describe("Symphony router — Linear trigger endpoint", () => {
  it("POST /v1/linear/trigger dispatches to a worktree", async () => {
    const testId = `E2E-TRG-${Date.now()}`;

    const res = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer local-symphony",
        "x-linear-identifier": testId,
        "x-linear-action": "update",
        "x-linear-thread-name": `${testId}: E2E trigger test`,
        "x-anqr-correlation-id": `e2e-trg-${Date.now()}`,
      },
      body: JSON.stringify({
        identifier: testId,
        title: "E2E trigger test",
        action: "update",
        source: "e2e-test",
        threadName: `${testId}: E2E trigger test`,
        timestamp: new Date().toISOString(),
      }),
    });

    const body = await res.json();
    // Should be dispatched, queued, or accepted
    expect([200, 202]).toContain(res.status);
    expect(["dispatched", "queued", "accepted"]).toContain(body.status);
  });

  it("trigger without identifier returns 400", async () => {
    const res = await fetch(`${SYMPHONY_ROUTER_URL}/v1/linear/trigger`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Missing identifier" }),
    });
    expect(res.status).toBe(400);
  });
});

describe("Service fleet — all critical services healthy", () => {
  it("Linear webhook receiver is healthy", async () => {
    const body = await assertServiceHealthy(LINEAR_WEBHOOK_URL);
    expect(body.status).toBe("ok");
  });

  it("Discord router is healthy", async () => {
    const body = await assertServiceHealthy(DISCORD_ROUTER_URL);
    expect(body.status).toBe("ok");
  });

  it("Symphony router is healthy", async () => {
    const body = await assertServiceHealthy(SYMPHONY_ROUTER_URL);
    expect(body.status).toBe("ok");
  });

  it("all 8 executor bridges are reachable", async () => {
    for (let i = 1; i <= 8; i++) {
      const res = await fetch(`http://127.0.0.1:${4320 + i}/health`);
      expect(res.ok, `wt${i} health check failed`).toBe(true);
      const body = await res.json();
      expect(body.status).toBe("ok");
    }
  });
});
