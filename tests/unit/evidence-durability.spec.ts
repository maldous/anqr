import { describe, it, expect, afterAll, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Workstream G Phase 1 — Evidence durability tests.
 *
 * Covers:
 * - File-level locking (withEvidenceLock) serializes concurrent writes
 * - Corruption detection (loadEvidenceRecordWithDiagnostics) distinguishes missing vs corrupted
 * - ensureEvidenceRecord idempotency
 * - updateEvidenceRecord logging on missing/corrupted records
 * - Architecture guard: barrel exports include new functions
 */

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// ---------------------------------------------------------------------------
// 1. Architecture guard — barrel exports
// ---------------------------------------------------------------------------

describe("Evidence durability — architecture guard", () => {
  it("task-evidence index.mjs exports ensureEvidenceRecord", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("ensureEvidenceRecord");
  });

  it("task-evidence index.mjs exports loadEvidenceRecordWithDiagnostics", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/index.mjs"),
      "utf-8",
    );
    expect(source).toContain("loadEvidenceRecordWithDiagnostics");
  });

  it("updateEvidenceRecord uses withEvidenceLock", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/update-evidence-record.mjs"),
      "utf-8",
    );
    expect(source).toContain("withEvidenceLock");
    expect(source).toContain("loadEvidenceRecordWithDiagnostics");
  });

  it("withEvidenceLock uses O_EXCL for atomic lock acquisition", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/try-acquire-lock.mjs"),
      "utf-8",
    );
    expect(source).toContain("O_EXCL");
    expect(source).toContain("O_CREAT");
    expect(source).toContain("process.pid");
  });

  it("withEvidenceLock degrades gracefully on lock failure (advisory, not blocking)", () => {
    const source = fs.readFileSync(
      path.resolve(REPO_ROOT, "harness/ops/core/task-evidence/with-evidence-lock.mjs"),
      "utf-8",
    );
    // On lock failure, proceeds unlocked with warning
    expect(source).toContain("proceeding unlocked");
    expect(source).toContain("return fn()");
  });
});

// ---------------------------------------------------------------------------
// 2. loadEvidenceRecordWithDiagnostics — runtime
// ---------------------------------------------------------------------------

describe("loadEvidenceRecordWithDiagnostics — runtime", () => {
  const corrId = `test-diag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("returns { status: 'missing' } for non-existent record", async () => {
    const { loadEvidenceRecordWithDiagnostics } = await import(
      "../../harness/ops/core/task-evidence/load-evidence-record-with-diagnostics.mjs"
    );
    const result = loadEvidenceRecordWithDiagnostics(`nonexistent-${Date.now()}`);
    expect(result.status).toBe("missing");
    expect(result).not.toHaveProperty("record");
    expect(result).not.toHaveProperty("error");
  });

  it("returns { status: 'ok', record } for valid record", async () => {
    const { saveEvidence } = await import(
      "../../harness/ops/core/task-evidence/save-evidence.mjs"
    );
    const { loadEvidenceRecordWithDiagnostics } = await import(
      "../../harness/ops/core/task-evidence/load-evidence-record-with-diagnostics.mjs"
    );
    saveEvidence(corrId, { correlationId: corrId, test: true });

    const result = loadEvidenceRecordWithDiagnostics(corrId);
    expect(result.status).toBe("ok");
    expect((result as { status: "ok"; record: { correlationId: string } }).record.correlationId).toBe(corrId);
  });

  it("returns { status: 'corrupted', error } for invalid JSON", async () => {
    const { loadEvidenceRecordWithDiagnostics } = await import(
      "../../harness/ops/core/task-evidence/load-evidence-record-with-diagnostics.mjs"
    );
    // Write garbage to the evidence file
    fs.writeFileSync(evidencePath, "this is not valid json {{{");

    const result = loadEvidenceRecordWithDiagnostics(corrId);
    expect(result.status).toBe("corrupted");
    expect((result as { status: "corrupted"; error: string }).error).toContain("parse error");
  });
});

// ---------------------------------------------------------------------------
// 3. ensureEvidenceRecord — runtime
// ---------------------------------------------------------------------------

describe("ensureEvidenceRecord — runtime", () => {
  const corrId = `test-ensure-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
  });

  it("creates a new record when none exists", async () => {
    const { ensureEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/ensure-evidence-record.mjs"
    );
    const result = ensureEvidenceRecord(corrId, {
      source: "test",
      issueIdentifier: "ANQ-TEST-1",
    });

    expect(result).not.toBeNull();
    expect(result.correlationId).toBe(corrId);
    expect(result.ingress.source).toBe("test");
    expect(result.ingress.issueIdentifier).toBe("ANQ-TEST-1");
    expect(result.createdAt).toBeTruthy();
    expect(fs.existsSync(evidencePath)).toBe(true);
  });

  it("returns existing record without overwriting", async () => {
    const { ensureEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/ensure-evidence-record.mjs"
    );
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );

    // Add data to the existing record
    updateEvidenceRecord(corrId, {
      execution: { success: true, completedAt: new Date().toISOString() },
    });

    // ensureEvidenceRecord should return the existing record, not overwrite
    const result = ensureEvidenceRecord(corrId, {
      source: "different-source",
      issueIdentifier: "ANQ-DIFFERENT",
    });

    expect(result.ingress.source).toBe("test");
    expect(result.execution).toBeTruthy();
    expect(result.execution.success).toBe(true);
  });

  it("defaults source to 'unknown' when not provided", async () => {
    const { ensureEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/ensure-evidence-record.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );

    const unknownCorrId = `test-ensure-unknown-${Date.now()}`;
    const unknownPath = getEvidencePath(unknownCorrId);
    try {
      const result = ensureEvidenceRecord(unknownCorrId, {});
      expect(result.ingress.source).toBe("unknown");
    } finally {
      if (fs.existsSync(unknownPath)) fs.unlinkSync(unknownPath);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. updateEvidenceRecord with locking — runtime
// ---------------------------------------------------------------------------

describe("updateEvidenceRecord with locking — runtime", () => {
  const corrId = `test-locked-update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  beforeAll(async () => {
    const { saveEvidence } = await import(
      "../../harness/ops/core/task-evidence/save-evidence.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
    saveEvidence(corrId, {
      correlationId: corrId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  afterAll(() => {
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
    // Clean up lock file if it exists
    const lockPath = evidencePath + ".lock";
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  });

  it("still returns null for missing records", async () => {
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );
    const result = updateEvidenceRecord("completely-missing-id", { foo: "bar" });
    expect(result).toBeNull();
  });

  it("merges patches correctly under lock", async () => {
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );

    // First update
    const result1 = updateEvidenceRecord(corrId, {
      routing: { decidedAt: new Date().toISOString(), strategy: "least-loaded" },
    });
    expect(result1).not.toBeNull();
    expect(result1.routing.strategy).toBe("least-loaded");

    // Second update should merge, not overwrite routing
    const result2 = updateEvidenceRecord(corrId, {
      execution: { success: true },
    });
    expect(result2).not.toBeNull();
    expect(result2.routing.strategy).toBe("least-loaded");
    expect(result2.execution.success).toBe(true);
  });

  it("returns null for corrupted records without crashing", async () => {
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );

    const corruptId = `test-corrupt-${Date.now()}`;
    const corruptPath = getEvidencePath(corruptId);
    try {
      fs.writeFileSync(corruptPath, "NOT VALID JSON !!!");
      const result = updateEvidenceRecord(corruptId, { test: true });
      expect(result).toBeNull();
    } finally {
      if (fs.existsSync(corruptPath)) fs.unlinkSync(corruptPath);
      const lockPath = corruptPath + ".lock";
      if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
    }
  });

  it("no lock file remains after successful update", async () => {
    const { updateEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/update-evidence-record.mjs"
    );
    updateEvidenceRecord(corrId, { lockTest: true });
    const lockPath = evidencePath + ".lock";
    expect(fs.existsSync(lockPath)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. withEvidenceLock — runtime behavior
// ---------------------------------------------------------------------------

describe("withEvidenceLock — runtime", () => {
  it("acquires and releases lock around fn execution", async () => {
    const { withEvidenceLock } = await import(
      "../../harness/ops/core/task-evidence/with-evidence-lock.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );

    const lockCorrId = `test-lock-${Date.now()}`;
    const lockPath = getEvidencePath(lockCorrId) + ".lock";

    let lockExistedDuringFn = false;
    const result = withEvidenceLock(lockCorrId, () => {
      lockExistedDuringFn = fs.existsSync(lockPath);
      return 42;
    });

    expect(result).toBe(42);
    expect(lockExistedDuringFn).toBe(true);
    expect(fs.existsSync(lockPath)).toBe(false);
  });

  it("releases lock even when fn throws", async () => {
    const { withEvidenceLock } = await import(
      "../../harness/ops/core/task-evidence/with-evidence-lock.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );

    const lockCorrId = `test-lock-throw-${Date.now()}`;
    const lockPath = getEvidencePath(lockCorrId) + ".lock";

    try {
      withEvidenceLock(lockCorrId, () => {
        throw new Error("test error");
      });
    } catch {
      // expected
    }

    expect(fs.existsSync(lockPath)).toBe(false);
  });

  it("proceeds unlocked when stale lock exists and is broken", async () => {
    const { withEvidenceLock } = await import(
      "../../harness/ops/core/task-evidence/with-evidence-lock.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    const { getEvidenceDir } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-dir.mjs"
    );

    // Ensure evidence directory exists
    getEvidenceDir();

    const lockCorrId = `test-stale-lock-${Date.now()}`;
    const lockPath = getEvidencePath(lockCorrId) + ".lock";

    // Create a stale lock with a fake PID and old mtime
    fs.writeFileSync(lockPath, "99999999\n1000000000000");
    // Set mtime to 10 seconds ago (exceeds 5s stale threshold)
    const oldTime = new Date(Date.now() - 10000);
    fs.utimesSync(lockPath, oldTime, oldTime);

    let executed = false;
    withEvidenceLock(lockCorrId, () => {
      executed = true;
    });

    expect(executed).toBe(true);
    // Lock should be cleaned up
    expect(fs.existsSync(lockPath)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Sequential updates preserve all fields (locking correctness)
// ---------------------------------------------------------------------------

describe("Sequential evidence updates preserve all fields", () => {
  const corrId = `test-sequential-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let evidencePath: string;

  afterAll(async () => {
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );
    evidencePath = getEvidencePath(corrId);
    if (evidencePath && fs.existsSync(evidencePath)) fs.unlinkSync(evidencePath);
    const lockPath = evidencePath + ".lock";
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  });

  it("create → routing → execution → validation → push → integration all preserved", async () => {
    const { createEvidenceRecord } = await import(
      "../../harness/ops/core/task-evidence/create-evidence-record.mjs"
    );
    const { recordRoutingDecision } = await import(
      "../../harness/ops/core/task-evidence/record-routing-decision.mjs"
    );
    const { recordWorktreeSelection } = await import(
      "../../harness/ops/core/task-evidence/record-worktree-selection.mjs"
    );
    const { recordExecutionResult } = await import(
      "../../harness/ops/core/task-evidence/record-execution-result.mjs"
    );
    const { recordValidationResult } = await import(
      "../../harness/ops/core/task-evidence/record-validation-result.mjs"
    );
    const { recordPushResult } = await import(
      "../../harness/ops/core/task-evidence/record-push-result.mjs"
    );
    const { recordIntegrationResult } = await import(
      "../../harness/ops/core/task-evidence/record-integration-result.mjs"
    );
    const { getEvidencePath } = await import(
      "../../harness/ops/core/task-evidence/get-evidence-path.mjs"
    );

    evidencePath = getEvidencePath(corrId);

    // Full lifecycle under locking
    createEvidenceRecord(corrId, { source: "linear", issueIdentifier: "ANQ-LOCK-1" });
    recordRoutingDecision(corrId, { targetWorktreePool: "linear-wt1-4", routingStrategy: "least-loaded" });
    recordWorktreeSelection(corrId, { worktreeId: "wt3", reason: "least-loaded" });
    recordExecutionResult(corrId, { success: true, completedAt: new Date().toISOString(), durationMs: 45000, filesChanged: ["src/main.tsx"] });
    recordValidationResult(corrId, { passed: true, typecheckPassed: true, testsPassed: true });
    recordPushResult(corrId, { branch: "symphony/wt3", sha: "abc123", success: true });
    recordIntegrationResult(corrId, { success: true, mainSha: "def456", method: "cherry-pick" });

    // Verify all fields preserved
    const loaded = JSON.parse(fs.readFileSync(evidencePath, "utf-8"));
    expect(loaded.correlationId).toBe(corrId);
    expect(loaded.ingress.source).toBe("linear");
    expect(loaded.ingress.issueIdentifier).toBe("ANQ-LOCK-1");
    expect(loaded.routing.routingStrategy).toBe("least-loaded");
    expect(loaded.worktreeSelection.worktreeId).toBe("wt3");
    expect(loaded.execution.success).toBe(true);
    expect(loaded.execution.filesChanged).toEqual(["src/main.tsx"]);
    expect(loaded.validation.passed).toBe(true);
    expect(loaded.validation.typecheckPassed).toBe(true);
    expect(loaded.push.branch).toBe("symphony/wt3");
    expect(loaded.push.sha).toBe("abc123");
    expect(loaded.integration.success).toBe(true);
    expect(loaded.integration.mainSha).toBe("def456");
  });
});
