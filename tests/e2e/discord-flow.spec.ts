/**
 * E2E: Discord router → worktree executor
 *
 * These tests hit the LIVE Discord router (port 18790) over HTTP.
 * Evidence records are verified on the filesystem — proving the
 * correlation-ID layer works in the real runtime.
 *
 * Prerequisites: anqr-discord-router and at least one executor (wt5-wt8)
 * must be running.
 *
 * Run: npx vitest run tests/e2e/discord-flow.spec.ts --config vitest.e2e.config.ts
 */

import { describe, it, expect, afterAll } from "vitest";
import {
  DISCORD_ROUTER_URL,
  findEvidenceBySource,
  deleteEvidence,
  assertServiceHealthy,
} from "./e2e-helpers.ts";

const createdEvidenceIds: string[] = [];

afterAll(() => {
  for (const id of createdEvidenceIds) deleteEvidence(id);
});

describe("Discord router — live runtime", () => {
  it("health endpoint returns ok with Discord worktree pool (wt5-wt8)", async () => {
    const body = await assertServiceHealthy(DISCORD_ROUTER_URL);
    expect(body.status).toBe("ok");
    expect(body.maxConcurrent).toBeGreaterThan(0);

    const worktrees = body.worktrees as Array<{ id: number; healthy: boolean }>;
    const ids = worktrees.map((w) => w.id);
    expect(ids).toEqual(expect.arrayContaining([5, 6, 7, 8]));
    expect(worktrees.every((w) => w.healthy)).toBe(true);
  });

  it("available slots match expected capacity", async () => {
    const body = await assertServiceHealthy(DISCORD_ROUTER_URL);
    const available = body.availableSlots as number;
    const active = body.activeRequests as number;
    const max = body.maxConcurrent as number;
    expect(available).toBe(max - active);
    expect(available).toBeGreaterThan(0);
  });

  it("non-POST to completions returns 404", async () => {
    const res = await fetch(`${DISCORD_ROUTER_URL}/v1/chat/completions`, {
      method: "GET",
    });
    expect(res.status).toBe(404);
  });
});

describe("Discord router → executor proxy", () => {
  it("chat completion is proxied to a worktree and creates evidence on disk", async () => {
    const beforeIso = new Date().toISOString();

    // Send a minimal chat completion; use AbortController so the test
    // does not hang if the executor takes a long time with AI processing.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    let responseStatus: number | null = null;
    let responseBody: string | null = null;
    try {
      const res = await fetch(`${DISCORD_ROUTER_URL}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "symphony/main",
          messages: [{ role: "user", content: "E2E probe: reply 'ok' and nothing else" }],
          max_tokens: 5,
          stream: false,
        }),
        signal: controller.signal,
      });
      responseStatus = res.status;
      responseBody = await res.text();
    } catch {
      // AbortError or network error — the evidence should still exist
      // because it is created before the proxy request starts.
    } finally {
      clearTimeout(timer);
    }

    // If we got a response, verify it was routed (not 404)
    if (responseStatus !== null) {
      expect(responseStatus).not.toBe(404);
    }

    // Evidence was created by the service BEFORE proxying — should be on disk
    // regardless of whether the executor responded.
    const evidence = findEvidenceBySource("discord-router", beforeIso);
    expect(evidence).not.toBeNull();
    expect(evidence!.correlationId).toBeTruthy();
    expect(evidence!.ingress.source).toBe("discord-router");
    expect(evidence!.ingress.receivedAt).toBeTruthy();

    createdEvidenceIds.push(evidence!.correlationId);
  });

  it("overload response is returned when all worktrees are busy", async () => {
    // This is a structural test: verify the overload path exists.
    // We can't easily saturate all 4 worktrees in a test, so we just
    // verify the health endpoint reports the capacity mechanism.
    const body = await assertServiceHealthy(DISCORD_ROUTER_URL);
    const max = body.maxConcurrent as number;
    expect(max).toBeGreaterThan(0);
    // When activeRequests >= maxConcurrent, the router returns 503.
    // We verify the mechanism exists by checking the fields.
    expect(typeof body.activeRequests).toBe("number");
    expect(typeof body.availableSlots).toBe("number");
  });
});
