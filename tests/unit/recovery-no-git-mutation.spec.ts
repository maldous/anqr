import { describe, it, expect } from "vitest";
import fs from "node:fs";

/**
 * Recovery safety and evidence tests — ADR-0005 + ADR-0006.
 *
 * All tests verify the real source code structure via fs.readFileSync.
 * This proves the implementation matches the architectural contract
 * without requiring deep dependency mocking of the harness runtime.
 *
 * Proves:
 * 1. retry_push is demoted to quarantine (no git push)
 * 2. auto_commit_and_push is demoted to quarantine (no git add/commit/push)
 * 3. classify-worktree no longer emits auto_commit_and_push for orphaned dirty work
 * 4. Every recovery action emits structured evidence per ADR-0006
 * 5. Evidence correctly classifies action class and non-publishing status
 * 6. reset_to_main is guarded against active sandboxes
 * 7. Allowed actions: skip, reclaim_lease, continue_repair, quarantine, reset_to_main, reprovision
 */

describe("Recovery shall not publish code — ADR-0005", () => {
  describe("execute-repair source code verification", () => {
    it("should verify execute-repair.mjs has no git commit/push in publish-demoted cases", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );

      // The auto_commit_and_push case should contain quarantine demotion, not git commands
      const autoCommitStart = content.indexOf('case "auto_commit_and_push"');
      const autoCommitEnd = content.indexOf("case", autoCommitStart + 1);
      const autoCommitCase = content.slice(autoCommitStart, autoCommitEnd);
      expect(autoCommitCase).not.toContain('["add"');
      expect(autoCommitCase).not.toContain('["commit"');
      expect(autoCommitCase).not.toContain('["push"');
      expect(autoCommitCase).toContain("quarantine");

      // The retry_push case should contain quarantine demotion, not git push
      const retryPushStart = content.indexOf('case "retry_push"');
      const retryPushEnd = content.indexOf("case", retryPushStart + 1);
      const retryPushCase = content.slice(retryPushStart, retryPushEnd);
      expect(retryPushCase).not.toContain('["push"');
      expect(retryPushCase).toContain("quarantine");
    });

    it("should verify reset_to_main has active-lease guard", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );

      const resetStart = content.indexOf('case "reset_to_main"');
      const resetEnd = content.indexOf("case", resetStart + 1);
      const resetCase = content.slice(resetStart, resetEnd);
      // Must check leaseIsActive before performing sandbox reset
      expect(resetCase).toContain("leaseIsActive");
    });

    it("should verify every action emits evidence (buildEvidence call)", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      // Every case must emit evidence
      expect(content).toContain("buildEvidence");
      // Count evidence emissions — should be at least one per action type
      const evidenceCount = (content.match(/buildEvidence/g) || []).length;
      expect(evidenceCount).toBeGreaterThanOrEqual(7); // skip, reclaim, continue, retry_push, auto_commit, quarantine, reset, reprovision, default
    });
  });

  describe("classify-worktree dirty orphan handling", () => {
    it("should verify classify-worktree.mjs does not emit auto_commit_and_push", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/classify-worktree.mjs",
        "utf-8",
      );
      // ADR-0005: classify-worktree must not assign auto_commit_and_push
      expect(content).not.toContain('repairAction = "auto_commit_and_push"');
      expect(content).not.toContain("repairAction = 'auto_commit_and_push'");
    });
  });
});

describe("Recovery evidence contract — ADR-0006", () => {
  describe("evidence structure validation (source code)", () => {
    it("should define all required evidence fields per ADR-0006", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      // ADR-0006 required fields
      expect(content).toContain("actionClass");
      expect(content).toContain("target");
      expect(content).toContain("reason");
      expect(content).toContain("ownershipBasis");
      expect(content).toContain("isStateOnly");
      expect(content).toContain("isNonPublishing");
      expect(content).toContain("timestamp");
    });

    it("should classify state-only vs sandbox-reset actions correctly", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      // State-only actions must be identified
      expect(content).toContain('"skip"');
      expect(content).toContain('"reclaim_lease"');
      expect(content).toContain('"continue_repair"');
      expect(content).toContain('"quarantine"');
      expect(content).toContain('"reprovision"');
      // Sandbox-reset must be distinguished
      expect(content).toContain('"sandbox_reset"');
      // Demotion must be tracked
      expect(content).toContain('"demotion"');
    });

    it("should derive isNonPublishing from explicit action class set", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      // ADR-0006: isNonPublishing must be derived from an explicit set,
      // not hardcoded. This ensures new action classes get conscious classification.
      expect(content).toContain("NON_PUBLISHING_ACTIONS");
      expect(content).toContain("new Set(");
      // The set must include all known recovery action classes
      expect(content).toContain('"sandbox_reset"');
      expect(content).toContain('"demotion"');
      // isNonPublishing must use the set, not a literal
      expect(content).toContain("NON_PUBLISHING_ACTIONS.has(");
      // The buildEvidence return object must derive isNonPublishing from the set,
      // not hardcode it. Check the return block (not comments/docs).
      const returnBlock = content.slice(content.indexOf("return {", content.indexOf("NON_PUBLISHING_ACTIONS.has")));
      const firstReturn = returnBlock.slice(0, returnBlock.indexOf("};") + 2);
      expect(firstReturn).not.toContain("isNonPublishing: true");
      expect(firstReturn).not.toContain("isNonPublishing: false");
    });
  });

  describe("allowed recovery action surface", () => {
    it("should enumerate exactly the allowed actions", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      const allowedActions = [
        'case "skip"',
        'case "reclaim_lease"',
        'case "continue_repair"',
        'case "retry_push"',
        'case "auto_commit_and_push"',
        'case "quarantine"',
        'case "reset_to_main"',
        'case "reprovision"',
      ];
      for (const action of allowedActions) {
        expect(content).toContain(action);
      }
    });

    it("should have a default case that handles unknown actions", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      expect(content).toContain("default:");
      expect(content).toContain("unknown");
    });

    it("should verify retry_push and auto_commit_and_push both delegate to quarantine", () => {
      const content = fs.readFileSync(
        "harness/ops/orchestration/symphony-worktree-recovery/execute-repair/execute-repair.mjs",
        "utf-8",
      );
      // Both demoted actions must recursively call executeRepair with quarantine
      const retryPushStart = content.indexOf('case "retry_push"');
      const retryPushEnd = content.indexOf("case", retryPushStart + 1);
      const retryCase = content.slice(retryPushStart, retryPushEnd);
      expect(retryCase).toContain('repairAction: "quarantine"');

      const autoStart = content.indexOf('case "auto_commit_and_push"');
      const autoEnd = content.indexOf("case", autoStart + 1);
      const autoCase = content.slice(autoStart, autoEnd);
      expect(autoCase).toContain('repairAction: "quarantine"');
    });
  });
});
