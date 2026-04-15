/**
 * Workstream G prerequisite — B state model backdoor closure.
 *
 * Validates:
 * 1. patchIssueState rejects lifecycle-determining fields
 * 2. patchIssueState allows metadata-only fields
 * 3. LIFECYCLE_FIELDS export contains all expected members
 * 4. integration_pending → completed is rejected
 * 5. evidence_pending → evidence_pending self-transition succeeds
 * 6. blocked → eligible auto-clears blocking fields
 * 7. publish-evidence-and-close uses transitionIssue (not patchIssueState)
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// @ts-ignore - No type declarations for .mjs module
import {
  patchIssueState,
  LIFECYCLE_FIELDS,
  transitionIssue,
  isValidIssueTransition,
  inferExecutionPhase,
} from "../../harness/ops/core/symphony-state.mjs";

const TEST_STATE_DIR = resolve(process.cwd(), "reports", "b-prereq-test");

describe("B prerequisite: patchIssueState lifecycle guard", () => {
  beforeEach(() => {
    process.env.ANQR_SYMPHONY_STATE_DIR = TEST_STATE_DIR;
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_STATE_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    delete process.env.ANQR_SYMPHONY_STATE_DIR;
  });

  it("throws when writing 'finalization'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-1", { finalization: { state: "x" } }),
    ).toThrow(/lifecycle fields.*finalization.*transitionIssue/);
  });

  it("throws when writing 'completed_at'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-2", { completed_at: new Date().toISOString() }),
    ).toThrow(/lifecycle fields.*completed_at.*transitionIssue/);
  });

  it("throws when writing 'lease'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-3", { lease: { owner: "test" } }),
    ).toThrow(/lifecycle fields.*lease.*transitionIssue/);
  });

  it("throws when writing 'human_only'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-4", { human_only: true }),
    ).toThrow(/lifecycle fields.*human_only.*transitionIssue/);
  });

  it("throws when writing 'retry_exhausted'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-5", { retry_exhausted: true }),
    ).toThrow(/lifecycle fields.*retry_exhausted.*transitionIssue/);
  });

  it("throws when writing 'blocked_reason'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-6", { blocked_reason: "test" }),
    ).toThrow(/lifecycle fields.*blocked_reason.*transitionIssue/);
  });

  it("throws when writing 'cooldown_until'", () => {
    expect(() =>
      patchIssueState("ANQ-LG-7", { cooldown_until: new Date().toISOString() }),
    ).toThrow(/lifecycle fields.*cooldown_until.*transitionIssue/);
  });

  it("lists all violating fields in the error message", () => {
    expect(() =>
      patchIssueState("ANQ-LG-8", {
        human_only: true,
        blocked_reason: "test",
        source: "ok",
      }),
    ).toThrow(/human_only.*blocked_reason|blocked_reason.*human_only/);
  });

  it("allows metadata fields (source, retry_count, notes, etc.)", () => {
    const result = patchIssueState("ANQ-LG-10", {
      source: "test",
      retry_count: 3,
      notes: { foo: "bar" },
      last_run_id: "run-123",
      latency_ms: 5000,
      last_attempt_at: new Date().toISOString(),
      last_failure_reason: null,
      last_failure_signature: null,
      external_keys: ["key-1"],
      transitions: [{ at: new Date().toISOString(), from: "a", to: "b" }],
    });
    expect(result.source).toBe("test");
    expect(result.retry_count).toBe(3);
    expect(result.notes.foo).toBe("bar");
  });
});

describe("B prerequisite: LIFECYCLE_FIELDS export", () => {
  it("contains all lifecycle-determining fields", () => {
    const expected = [
      "lease",
      "finalization",
      "completed_at",
      "human_only",
      "retry_exhausted",
      "blocked_reason",
      "cooldown_until",
    ];
    for (const field of expected) {
      expect(LIFECYCLE_FIELDS.has(field)).toBe(true);
    }
    expect(LIFECYCLE_FIELDS.size).toBe(expected.length);
  });
});

describe("B prerequisite: transition map changes", () => {
  it("rejects integration_pending → completed (must go through evidence_pending)", () => {
    expect(isValidIssueTransition("integration_pending", "completed")).toBe(false);
  });

  it("allows integration_pending → evidence_pending", () => {
    expect(isValidIssueTransition("integration_pending", "evidence_pending")).toBe(true);
  });

  it("allows evidence_pending → evidence_pending self-transition", () => {
    expect(isValidIssueTransition("evidence_pending", "evidence_pending")).toBe(true);
  });

  it("still allows evidence_pending → completed", () => {
    expect(isValidIssueTransition("evidence_pending", "completed")).toBe(true);
  });
});

describe("B prerequisite: blocked → eligible auto-clear", () => {
  beforeEach(() => {
    process.env.ANQR_SYMPHONY_STATE_DIR = TEST_STATE_DIR;
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    mkdirSync(TEST_STATE_DIR, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(TEST_STATE_DIR)) {
      rmSync(TEST_STATE_DIR, { recursive: true, force: true });
    }
    delete process.env.ANQR_SYMPHONY_STATE_DIR;
  });

  it("auto-clears blocked_reason, human_only, retry_exhausted on unblock", () => {
    // Transition eligible → blocked with blocking fields
    const blockResult = transitionIssue("ANQ-AC-1", "blocked", {
      blocked_reason: "test_block",
      human_only: true,
      retry_exhausted: true,
      reason: "test",
    });
    expect(blockResult.ok).toBe(true);
    expect(inferExecutionPhase(blockResult.record)).toBe("blocked");

    // Transition blocked → eligible (unblock)
    const unblockResult = transitionIssue("ANQ-AC-1", "eligible", {
      reason: "unblock",
    });
    expect(unblockResult.ok).toBe(true);
    expect(unblockResult.record.blocked_reason).toBeNull();
    expect(unblockResult.record.human_only).toBe(false);
    expect(unblockResult.record.retry_exhausted).toBe(false);
  });

  it("preserves non-blocking metadata across unblock", () => {
    // Set metadata first
    patchIssueState("ANQ-AC-2", { source: "email", retry_count: 3 });

    // Block
    transitionIssue("ANQ-AC-2", "blocked", {
      blocked_reason: "human_only",
      human_only: true,
      reason: "test",
    });

    // Unblock
    const result = transitionIssue("ANQ-AC-2", "eligible", { reason: "unblock" });
    expect(result.ok).toBe(true);
    expect(result.record.source).toBe("email");
    expect(result.record.retry_count).toBe(3);
  });
});

describe("B prerequisite: publish-evidence-and-close uses transitionIssue", () => {
  const publishPath = resolve(
    "harness/ops/orchestration/symphony-integrator/integrate-candidate/publish-evidence-and-close.mjs",
  );
  const publishSource = readFileSync(publishPath, "utf-8");

  it("imports transitionIssue (not patchIssueState)", () => {
    expect(publishSource).toContain("transitionIssue");
    expect(publishSource).not.toContain("patchIssueState");
  });

  it("calls transitionIssue with evidence_pending target", () => {
    expect(publishSource).toContain('transitionIssue(issueIdentifier, "evidence_pending"');
  });
});
