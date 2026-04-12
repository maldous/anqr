import { describe, it, expect, beforeEach } from "vitest";
import { createEvidenceRecord, loadEvidenceRecord, recordPushResult, recordIntegrationResult, appendEvidenceEvent } from "../../harness/ops/core/task-evidence.mjs";
import { generateCorrelationId } from "../../harness/ops/lib/correlation-id.mjs";

// NOTE: These tests verify the task-evidence module API for integration scenarios.
// They are NOT true end-to-end runtime tests — they call the evidence helpers
// directly in-process rather than driving real branch pushes through the live
// integrator service.
describe("Task evidence: integration and promotion scenarios", () => {
  let correlationId: string;

  beforeEach(() => {
    correlationId = generateCorrelationId("integ");
  });

  it("clean integration: push → cherry-pick → main updated", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-100",
    });

    recordPushResult(correlationId, {
      branch: "symphony/wt1",
      sha: "aabbccdd",
      success: true,
    });

    recordIntegrationResult(correlationId, {
      mainSha: "eeff0011",
      success: true,
      method: "cherry-pick",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.push?.success).toBe(true);
    expect(record!.integration?.success).toBe(true);
    expect(record!.integration?.method).toBe("cherry-pick");
  });

  it("non-fast-forward conflict is recorded with details", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-200",
    });

    recordPushResult(correlationId, {
      branch: "symphony/wt2",
      sha: "11223344",
      success: true,
    });

    recordIntegrationResult(correlationId, {
      success: false,
      method: "cherry-pick",
      error: "CONFLICT (content): Merge conflict in package.json",
    });

    appendEvidenceEvent(correlationId, {
      type: "integration-blocked",
      detail: "Cherry-pick conflict — candidate queued for manual resolution",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.integration?.success).toBe(false);
    expect(record!.integration?.error).toContain("CONFLICT");
    expect(record!.events).toHaveLength(1);
  });

  it("invalid candidate rejection is recorded", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-300",
    });

    appendEvidenceEvent(correlationId, {
      type: "candidate-rejected",
      detail: "Branch symphony/wt3 has no commits ahead of main",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.events[0].type).toBe("candidate-rejected");
  });

  it("finalization state is tracked through evidence", () => {
    createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-400",
    });

    appendEvidenceEvent(correlationId, {
      type: "finalization-state-change",
      from: "pushed",
      to: "queued-for-integration",
    });

    appendEvidenceEvent(correlationId, {
      type: "finalization-state-change",
      from: "queued-for-integration",
      to: "integrated",
    });

    const record = loadEvidenceRecord(correlationId);
    expect(record!.events).toHaveLength(2);
    expect(record!.events[1].to).toBe("integrated");
  });

  it("evidence is complete and auditable for one task", () => {
    const record = createEvidenceRecord(correlationId, {
      source: "linear-webhook",
      issueIdentifier: "ANQ-500",
      webhookDeliveryId: "delivery-500",
    });

    expect(record.correlationId).toBeTruthy();
    expect(record.createdAt).toBeTruthy();
    expect(record.ingress.source).toBe("linear-webhook");
    expect(record.routing).toBeNull();
    expect(record.worktreeSelection).toBeNull();
    expect(record.providerSelection).toBeNull();
    expect(record.execution).toBeNull();
    expect(record.validation).toBeNull();
    expect(record.push).toBeNull();
    expect(record.integration).toBeNull();
    expect(record.watchdog).toEqual([]);
    expect(record.events).toEqual([]);
  });
});
