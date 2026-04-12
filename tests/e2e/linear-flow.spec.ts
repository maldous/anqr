import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvidenceRecord, loadEvidenceRecord, recordRoutingDecision, recordWorktreeSelection, recordProviderSelection, recordExecutionResult, recordValidationResult, recordPushResult, recordIntegrationResult, appendEvidenceEvent } from "../../harness/ops/core/task-evidence.mjs";
import { generateCorrelationId } from "../../harness/ops/lib/correlation-id.mjs";

// NOTE: These tests verify the task-evidence module API for Linear flow scenarios.
// They are NOT true end-to-end runtime tests — they call the evidence helpers
// directly in-process rather than driving real HTTP webhooks through the live
// webhook receiver, router, executor, runner, and integrator.
describe("Task evidence: Linear flow scenarios", () => {
  let correlationId: string;

  beforeEach(() => {
    correlationId = generateCorrelationId("linear");
  });

  it("happy path: webhook → route → execute → validate → push → integrate", () => {
    const record = createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-1234",
      webhookDeliveryId: "delivery-abc-123",
    });

    expect(record.correlationId).toBe(correlationId);
    expect(record.ingress.source).toBe("linear-webhook");

    recordRoutingDecision(correlationId, {
      targetWorktreePool: "wt1-wt4",
      routingStrategy: "round-robin",
      queuePosition: 0,
    });

    recordWorktreeSelection(correlationId, {
      worktreeId: "wt1",
      reason: "first-available",
    });

    recordProviderSelection(correlationId, {
      providerName: "codebuff-direct",
      model: "codebuff-sdk",
      isFallback: false,
    });

    recordExecutionResult(correlationId, {
      startedAt: new Date().toISOString(),
      durationMs: 45000,
      success: true,
      filesChanged: ["src/feature.ts", "tests/feature.spec.ts"],
    });

    recordValidationResult(correlationId, {
      passed: true,
      typecheckPassed: true,
      testsPassed: true,
      lintPassed: true,
    });

    recordPushResult(correlationId, {
      branch: "symphony/wt1",
      sha: "abc1234",
      success: true,
    });

    recordIntegrationResult(correlationId, {
      mainSha: "def5678",
      success: true,
      method: "cherry-pick",
    });

    const final = loadEvidenceRecord(correlationId);
    expect(final).not.toBeNull();
    expect(final!.ingress.issueIdentifier).toBe("ANQ-1234");
    expect(final!.routing?.routingStrategy).toBe("round-robin");
    expect(final!.worktreeSelection?.worktreeId).toBe("wt1");
    expect(final!.providerSelection?.providerName).toBe("codebuff-direct");
    expect(final!.execution?.success).toBe(true);
    expect(final!.validation?.passed).toBe(true);
    expect(final!.push?.success).toBe(true);
    expect(final!.integration?.success).toBe(true);
  });

  it("duplicate webhook delivery is detectable", () => {
    const deliveryId = "delivery-dup-001";

    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-1234",
      webhookDeliveryId: deliveryId,
    });

    const secondCorrelationId = generateCorrelationId("linear");
    createEvidenceRecord(secondCorrelationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-1234",
      webhookDeliveryId: deliveryId,
    });

    appendEvidenceEvent(secondCorrelationId, {
      type: "duplicate-detected",
      originalCorrelationId: correlationId,
      webhookDeliveryId: deliveryId,
    });

    const record = loadEvidenceRecord(secondCorrelationId);
    expect(record!.events).toHaveLength(1);
    expect(record!.events[0].type).toBe("duplicate-detected");
  });

  it("executor failure produces durable evidence", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-5678",
    });

    recordRoutingDecision(correlationId, {
      targetWorktreePool: "wt1-wt4",
      routingStrategy: "round-robin",
    });

    recordWorktreeSelection(correlationId, { worktreeId: "wt2" });

    recordExecutionResult(correlationId, {
      startedAt: new Date().toISOString(),
      durationMs: 120000,
      success: false,
      error: "Provider timeout after 120s",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.execution?.success).toBe(false);
    expect(record!.execution?.error).toContain("timeout");
  });

  it("provider fallback is recorded", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-9999",
    });

    recordProviderSelection(correlationId, {
      providerName: "openrouter",
      model: "claude-3.5-sonnet",
      isFallback: true,
      fallbackReason: "codebuff-direct: rate limited",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.providerSelection?.isFallback).toBe(true);
    expect(record!.providerSelection?.fallbackReason).toContain("rate limited");
  });

  it("integration conflict is surfaced", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-1111",
    });

    recordPushResult(correlationId, {
      branch: "symphony/wt3",
      sha: "aaa1111",
      success: true,
    });

    recordIntegrationResult(correlationId, {
      success: false,
      method: "cherry-pick",
      error: "Merge conflict in src/main.tsx",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.integration?.success).toBe(false);
    expect(record!.integration?.error).toContain("Merge conflict");
  });
});
