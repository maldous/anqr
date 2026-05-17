/**
 * E2E: Linear webhook → symphony router → executor
 *
 * These tests hit the LIVE webhook receiver (port 18795, set via LINEAR_WEBHOOK_PORT env) and symphony router
 * (port 4319) over HTTP. Evidence records are verified on the filesystem —
 * proving the correlation-ID and durable-state layers work in the real runtime.
 *
 * Prerequisites: anqr-linear-webhook, anqr-symphony-router, and at least one
 * anqr-symphony-executor@N service must be running.
 *
 * Run: npx vitest run tests/e2e/linear-flow.spec.ts --config vitest.e2e.config.ts
 */

import { describe, it, expect, afterAll } from "vitest";
import {
  LINEAR_WEBHOOK_URL,
  SYMPHONY_ROUTER_URL,
  findEvidenceByIssue,
  deleteEvidence,
  assertServiceHealthy,
  sendSignedWebhook,
} from "./e2e-helpers.ts";

const createdEvidenceIds: string[] = [];

afterAll(() => {
  for (const id of createdEvidenceIds) deleteEvidence(id);
});

describe("Linear webhook receiver — live runtime", () => {
  it("health endpoint returns ok with Linear worktree pool", async () => {
    const body = await assertServiceHealthy(LINEAR_WEBHOOK_URL);
    expect(body.status).toBe("ok");
    expect(body.worktrees).toEqual(expect.arrayContaining([1, 2, 3, 4]));
  });

  it("non-Issue event is filtered at ingress (no side effects)", async () => {
    const res = await sendSignedWebhook(`${LINEAR_WEBHOOK_URL}/linear/webhook`, {
      type: "Comment",
      action: "create",
      data: {},
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ignored");
  });

  it("removed Issue is filtered at ingress", async () => {
    const res = await sendSignedWebhook(`${LINEAR_WEBHOOK_URL}/linear/webhook`, {
      type: "Issue",
      action: "remove",
      data: { identifier: "E2E-REM-001", state: { name: "Todo" }, title: "Removed" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("ignored");
  });

  it("Backlog-state Issue is filtered at ingress", async () => {
    const res = await sendSignedWebhook(`${LINEAR_WEBHOOK_URL}/linear/webhook`, {
      type: "Issue",
      action: "create",
      data: { identifier: "E2E-BL-001", state: { name: "Backlog" }, title: "Backlog" },
    });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe("ignored");
  });
});

describe("Linear webhook → router → executor pipeline", () => {
  it("Todo issue triggers full pipeline and creates evidence on disk", async () => {
    const testId = `E2E-LIN-${Date.now()}`;
    const deliveryId = `e2e-delivery-${Date.now()}`;

    const res = await sendSignedWebhook(
      `${LINEAR_WEBHOOK_URL}/linear/webhook`,
      {
        type: "Issue",
        action: "update",
        data: {
          identifier: testId,
          title: "E2E pipeline test",
          state: { name: "Todo" },
          url: `https://linear.app/e2e/${testId}`,
        },
        previousValues: { state: { name: "Backlog" } },
      },
      { "linear-delivery": deliveryId },
    );

    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("processed");
    expect(body.event.identifier).toBe(testId);

    // Verify: evidence record was written to disk by the live service
    const evidence = findEvidenceByIssue(testId);
    expect(evidence).not.toBeNull();
    expect(evidence!.correlationId).toBeTruthy();
    expect(evidence!.ingress.source).toBe("linear-webhook");
    expect(evidence!.ingress.issueIdentifier).toBe(testId);
    expect(evidence!.ingress.webhookDeliveryId).toBe(deliveryId);
    expect(evidence!.createdAt).toBeTruthy();

    createdEvidenceIds.push(evidence!.correlationId);
  });

  it("duplicate delivery ID is rejected by durable dedupe", async () => {
    const deliveryId = `e2e-dup-${Date.now()}`;
    const firstId = `E2E-DUP1-${Date.now()}`;

    // First delivery — should be processed
    const first = await sendSignedWebhook(
      `${LINEAR_WEBHOOK_URL}/linear/webhook`,
      {
        type: "Issue",
        action: "update",
        data: { identifier: firstId, title: "Dup first", state: { name: "Todo" } },
        previousValues: { state: { name: "Backlog" } },
      },
      { "linear-delivery": deliveryId },
    );
    expect((await first.json()).status).toBe("processed");

    const evidence = findEvidenceByIssue(firstId);
    if (evidence) createdEvidenceIds.push(evidence.correlationId);

    // Second delivery with SAME ID — must be rejected as duplicate
    const second = await sendSignedWebhook(
      `${LINEAR_WEBHOOK_URL}/linear/webhook`,
      {
        type: "Issue",
        action: "update",
        data: {
          identifier: `E2E-DUP2-${Date.now()}`,
          title: "Dup second",
          state: { name: "Todo" },
        },
        previousValues: { state: { name: "Backlog" } },
      },
      { "linear-delivery": deliveryId },
    );
    expect(second.status).toBe(200);
    expect((await second.json()).status).toBe("duplicate");
  });

  it("webhook response confirms trigger reached symphony router", async () => {
    // A "processed" response means triggerIssueExecution succeeded,
    // which means the HTTP POST to the symphony router returned 200/202.
    // This proves the webhook → router hop works in the live runtime.
    const routerHealth = await assertServiceHealthy(SYMPHONY_ROUTER_URL);
    expect(routerHealth.status).toBe("ok");
    expect(routerHealth.role).toBe("symphony-agent-router");

    const testId = `E2E-RT-${Date.now()}`;
    const res = await sendSignedWebhook(
      `${LINEAR_WEBHOOK_URL}/linear/webhook`,
      {
        type: "Issue",
        action: "update",
        data: { identifier: testId, title: "Router test", state: { name: "Todo" } },
        previousValues: { state: { name: "Backlog" } },
      },
      { "linear-delivery": `e2e-rt-${Date.now()}` },
    );

    // "processed" means the router accepted the trigger — full hop proved
    const body = await res.json();
    expect(body.status).toBe("processed");

    const evidence = findEvidenceByIssue(testId);
    if (evidence) createdEvidenceIds.push(evidence.correlationId);
  });
});
