import { describe, it, expect, afterAll, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Workstream G Phases 2–5 — Evidence closure gate tests.
 *
 * Covers:
 * - Architecture guards for closure gate wiring
 * - validateEvidenceCompleteness runtime at all levels
 * - Force-close with incomplete evidence architecture
 * - Audit helpers (auditEvidenceCompleteness, findIncompleteEvidence)
 * - Phase 4: no premature completion signals
 * - Phase 3: F5 selection rationale infrastructure
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// 1. Architecture guard — closure gate wiring
// ---------------------------------------------------------------------------

describe("Evidence closure gate — architecture guard", () => {
  it("publishEvidenceAndClose imports validateEvidenceCompleteness", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/publish-evidence-and-close.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("validateEvidenceCompleteness");
    expect(source).toContain("incomplete_evidence");
  });

  it("publishEvidenceAndClose validates evidence BEFORE posting comment", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/publish-evidence-and-close.mjs",
      ),
      "utf-8",
    );
    const gateIndex = source.indexOf("validateEvidenceCompleteness");
    const commentIndex = source.indexOf("await addComment(detail.id, evidenceComment)");
    const doneIndex = source.indexOf("await updateIssue(detail.id, { stateId: STATES.done })");
    expect(gateIndex).toBeGreaterThan(-1);
    expect(commentIndex).toBeGreaterThan(-1);
    expect(doneIndex).toBeGreaterThan(-1);
    expect(gateIndex).toBeLessThan(commentIndex);
    expect(gateIndex).toBeLessThan(doneIndex);
  });

  it("integrate-candidate imports forceCloseWithIncompleteEvidence", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/integrate-candidate.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("forceCloseWithIncompleteEvidence");
    expect(source).toContain("MAX_EVIDENCE_RETRIES");
    expect(source).toContain("evidence_override");
  });

  it("mandatory-evidence-fields defines all four levels", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/mandatory-evidence-fields.mjs"),
      "utf-8",
    );
    expect(source).toContain('"minimal"');
    expect(source).toContain('"standard"');
    expect(source).toContain('"full"');
    expect(source).toContain('"enriched"');
    expect(source).toContain("CONDITIONAL_CHECKS");
    expect(source).toContain("MAX_EVIDENCE_RETRIES");
  });

  it("task-evidence index.mjs exports validateEvidenceCompleteness", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateEvidenceCompleteness");
    expect(source).toContain("auditEvidenceCompleteness");
    expect(source).toContain("findIncompleteEvidence");
  });

  it("task-evidence.mjs facade re-exports new functions", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence.mjs"),
      "utf-8",
    );
    expect(source).toContain("validateEvidenceCompleteness");
    expect(source).toContain("auditEvidenceCompleteness");
    expect(source).toContain("findIncompleteEvidence");
  });

  it("forceCloseWithIncompleteEvidence records override in evidence", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/force-close-with-incomplete-evidence.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("evidenceOverride");
    expect(source).toContain("updateEvidenceRecord");
    expect(source).toContain("Evidence override");
  });
});

// ---------------------------------------------------------------------------
// 2. validateEvidenceCompleteness — runtime
// ---------------------------------------------------------------------------

describe("validateEvidenceCompleteness — runtime", () => {
  const corrId = `test-validate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    evidencePath = getEvidencePath(corrId);
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
    const lockPath = evidencePath + ".lock";
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  });

  it("returns { status: 'missing' } for non-existent record", async () => {
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    const result = validateEvidenceCompleteness(`nonexistent-${Date.now()}`, "minimal");
    expect(result.complete).toBe(false);
    expect(result.status).toBe("missing");
    expect(result.missing).toContain("record");
  });

  it("returns { status: 'corrupted' } for corrupted record", async () => {
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const corruptId = `test-corrupt-validate-${Date.now()}`;
    const corruptPath = getEvidencePath(corruptId);
    try {
      fs.writeFileSync(corruptPath, "NOT JSON {{{}");
      const result = validateEvidenceCompleteness(corruptId, "minimal");
      expect(result.complete).toBe(false);
      expect(result.status).toBe("corrupted");
    } finally {
      if (fs.existsSync(corruptPath)) fs.unlinkSync(corruptPath);
    }
  });

  it("minimal: complete with execution + integration", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");

    saveEvidence(corrId, {
      correlationId: corrId,
      execution: { success: true, completedAt: new Date().toISOString() },
      integration: { success: true, mainSha: "abc123" },
    });

    const result = validateEvidenceCompleteness(corrId, "minimal");
    expect(result.complete).toBe(true);
    expect(result.level).toBe("minimal");
    expect(result.missing).toEqual([]);
  });

  it("minimal: incomplete when integration.success is false", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    const failId = `test-validate-fail-${Date.now()}`;
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const failPath = getEvidencePath(failId);

    try {
      saveEvidence(failId, {
        correlationId: failId,
        execution: { success: true, completedAt: new Date().toISOString() },
        integration: { success: false, mainSha: null },
      });
      const result = validateEvidenceCompleteness(failId, "minimal");
      expect(result.complete).toBe(false);
      expect(result.missing).toContain("integration.success");
    } finally {
      if (fs.existsSync(failPath)) fs.unlinkSync(failPath);
    }
  });

  it("standard: requires ingress + push on top of minimal", async () => {
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    // corrId has minimal-only evidence
    const result = validateEvidenceCompleteness(corrId, "standard");
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("ingress.source");
    expect(result.missing).toContain("push.success");
  });

  it("standard: complete with full lifecycle evidence", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");

    saveEvidence(corrId, {
      correlationId: corrId,
      ingress: {
        source: "linear",
        issueIdentifier: "ANQ-TEST-1",
        receivedAt: new Date().toISOString(),
      },
      execution: {
        success: true,
        completedAt: new Date().toISOString(),
        durationMs: 5000,
      },
      validation: { passed: true, typecheckPassed: true, testsPassed: true },
      push: { success: true, branch: "symphony/wt3", sha: "abc123" },
      integration: { success: true, mainSha: "def456", method: "cherry-pick" },
    });

    const result = validateEvidenceCompleteness(corrId, "standard");
    expect(result.complete).toBe(true);
    expect(result.level).toBe("standard");
    expect(result.missing).toEqual([]);
  });

  it("full: requires providerRouting + providerSelection", async () => {
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    const result = validateEvidenceCompleteness(corrId, "full");
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("providerRouting");
    expect(result.missing).toContain("providerSelection");
  });

  it("conditional: validation fields required when push exists", async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { validateEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/validate-evidence-completeness.mjs");
    const condId = `test-validate-cond-${Date.now()}`;
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    const condPath = getEvidencePath(condId);

    try {
      saveEvidence(condId, {
        correlationId: condId,
        ingress: { source: "linear", issueIdentifier: "ANQ-COND-1" },
        execution: { success: true, completedAt: new Date().toISOString() },
        push: { success: true, branch: "symphony/wt1", sha: "aaa111" },
        integration: { success: true, mainSha: "bbb222" },
        // validation missing but push exists — conditional checks should flag it
      });
      const result = validateEvidenceCompleteness(condId, "standard");
      expect(result.complete).toBe(false);
      expect(result.missing).toContain("validation.passed");
    } finally {
      if (fs.existsSync(condPath)) fs.unlinkSync(condPath);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. auditEvidenceCompleteness — runtime
// ---------------------------------------------------------------------------

describe("auditEvidenceCompleteness — runtime", () => {
  const corrId = `test-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    evidencePath = getEvidencePath(corrId);

    saveEvidence(corrId, {
      correlationId: corrId,
      ingress: { source: "linear", issueIdentifier: "ANQ-AUDIT-1" },
      execution: { success: true, completedAt: new Date().toISOString() },
      validation: { passed: true, typecheckPassed: true, testsPassed: true },
      push: { success: true, branch: "symphony/wt2", sha: "aaa" },
      integration: { success: true, mainSha: "bbb" },
    });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("returns structured report with all levels", async () => {
    const { auditEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/audit-evidence-completeness.mjs");
    const report = auditEvidenceCompleteness(corrId);

    expect(report.status).toBe("ok");
    expect(report.highestComplete).toBe("standard");
    expect(report.levels.minimal.complete).toBe(true);
    expect(report.levels.standard.complete).toBe(true);
    expect(report.levels.full.complete).toBe(false);
    expect(report.record).toBeTruthy();
  });

  it("returns missing status for non-existent record", async () => {
    const { auditEvidenceCompleteness } =
      await import("../../harness/ops/core/task-evidence/audit-evidence-completeness.mjs");
    const report = auditEvidenceCompleteness(`nonexistent-${Date.now()}`);
    expect(report.status).toBe("missing");
  });
});

// ---------------------------------------------------------------------------
// 4. findIncompleteEvidence — runtime
// ---------------------------------------------------------------------------

describe("findIncompleteEvidence — runtime", () => {
  const corrId = `test-find-incomplete-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import("../../harness/ops/core/task-evidence/save-evidence.mjs");
    const { getEvidencePath } =
      await import("../../harness/ops/core/task-evidence/get-evidence-path.mjs");
    evidencePath = getEvidencePath(corrId);

    // Create a deliberately incomplete record
    saveEvidence(corrId, {
      correlationId: corrId,
      execution: { success: true, completedAt: new Date().toISOString() },
      // Missing: integration, ingress, push — incomplete at all levels
    });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("finds records missing mandatory fields", async () => {
    const { findIncompleteEvidence } =
      await import("../../harness/ops/core/task-evidence/find-incomplete-evidence.mjs");
    const incomplete = findIncompleteEvidence("minimal");
    const match = incomplete.find((r) => r.correlationId === corrId);
    expect(match).toBeTruthy();
    expect(match!.missing).toContain("integration.success");
  });
});

// ---------------------------------------------------------------------------
// 5. Phase 4 — no premature completion signals
// ---------------------------------------------------------------------------

describe("Phase 4 — no premature completion signals", () => {
  it("execute-linear-issue-request returns 'execution_complete' not 'completed'", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/execute-linear-issue-request.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain('status: "execution_complete"');
    expect(source).not.toContain('status: "completed"');
  });

  it("publishEvidenceAndClose and forceClose are the primary STATES.done setters", () => {
    const publishSource = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/publish-evidence-and-close.mjs",
      ),
      "utf-8",
    );
    expect(publishSource).toContain("STATES.done");

    const forceCloseSource = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/orchestration/symphony-integrator/integrate-candidate/force-close-with-incomplete-evidence.mjs",
      ),
      "utf-8",
    );
    expect(forceCloseSource).toContain("STATES.done");

    // Runner only sets STATES.done in no-file-change paths (tool-only work,
    // external completion) which bypass integration. The normal code-change
    // path uses inReview and relies on the integrator for Done.
    const runnerSource = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/orchestration/symphony-runner/execute-issue.mjs"),
      "utf-8",
    );
    const doneMatches = [...runnerSource.matchAll(/stateId:\s*STATES\.done/g)];
    // Only 2 legitimate no-change paths: agent_completed_via_tools, completed_externally
    expect(doneMatches.length).toBeLessThanOrEqual(2);
  });

  it("execute-linear-issue-request creates evidence record (A3 fix)", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-openai-bridge/execute-linear-issue-request.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("ensureEvidenceRecord");
    expect(source).toContain("randomUUID");
    expect(source).toContain('source: "direct-execute"');
  });
});

// ---------------------------------------------------------------------------
// 6. Phase 3 F5 — selection rationale infrastructure
// ---------------------------------------------------------------------------

describe("Phase 3 F5 — selection rationale infrastructure", () => {
  it("selectProvider supports selectionLog parameter", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/integrations/model/symphony-credit-gate/select-provider.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("selectionLog");
    expect(source).toContain('status: "selected"');
    expect(source).toContain('status: "skipped"');
    expect(source).toContain('status: "safety_net_selected"');
  });

  it("recordProviderRoutingEvidence includes selectionRationale field", () => {
    const source = fs.readFileSync(
      path.resolve(
        REPO_ROOT,
        "harness/ops/core/task-evidence/record-provider-routing-evidence.mjs",
      ),
      "utf-8",
    );
    expect(source).toContain("selectionRationale");
  });

  it("server.mjs wires selectionLog into selectProvider and propagates selectionRationale", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/integrations/model/symphony-openai-bridge/server.mjs"),
      "utf-8",
    );
    // server.mjs creates selectionLog array and passes it to selectProvider
    expect(source).toContain("const selectionLog = [];");
    expect(source).toContain("selectionLog,");
    // All recordProviderRoutingEvidence calls include selectionRationale
    const routingCallCount = (source.match(/recordProviderRoutingEvidence\(/g) || []).length;
    const rationaleCount = (source.match(/selectionRationale:/g) || []).length;
    expect(routingCallCount).toBeGreaterThanOrEqual(5);
    expect(rationaleCount).toBeGreaterThanOrEqual(routingCallCount);
  });
});
