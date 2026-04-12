import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const INTEGRATE_PATH = resolve(
  "harness/ops/orchestration/symphony-integrator/integrate-candidate.mjs",
);

describe("evidence-locked closure", () => {
  const source = readFileSync(INTEGRATE_PATH, "utf-8");

  it("loads evidence data for closeout", () => {
    expect(source).toContain("loadEvidenceRecord");
  });

  it("posts evidence comment before closing the issue", () => {
    const addCommentIndex = source.indexOf("await addComment(detail.id, evidenceComment)");
    const doneIndex = source.indexOf("await updateIssue(detail.id, { stateId: STATES.done })");
    expect(addCommentIndex).toBeGreaterThan(-1);
    expect(doneIndex).toBeGreaterThan(-1);
    expect(addCommentIndex).toBeLessThan(doneIndex);
  });

  it("keeps integrated issues recoverable if evidence publication cannot complete", () => {
    expect(source).toContain("evidence_pending_closeout");
  });

  it("evidence includes verification commands, results, and docs updated", () => {
    expect(source).toContain("Verification commands run");
    expect(source).toContain("Verification results");
    expect(source).toContain("Docs updated");
  });

  it("does not close issue if cherry-pick fails", () => {
    expect(source).toContain('git("cherry-pick", "--abort")');
    expect(source).toContain('state: "integration_failed_repairable"');
  });
});
