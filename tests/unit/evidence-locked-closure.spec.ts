import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const INTEGRATE_PATH = resolve(
  "harness/ops/orchestration/symphony-integrator/integrate-candidate.mjs",
);

describe("evidence-locked closure", () => {
  const source = readFileSync(INTEGRATE_PATH, "utf-8");

  it("imports recordIntegrationResult from task-evidence", () => {
    expect(source).toContain('import { recordIntegrationResult } from "../../core/task-evidence.mjs"');
  });

  it("posts evidence comment before closing the issue", () => {
    const evidenceIndex = source.indexOf("evidenceComment");
    const addCommentIndex = source.indexOf("addComment(detail.id, evidenceComment)");
    const doneIndex = source.indexOf("STATES.done");

    expect(evidenceIndex).toBeGreaterThan(-1);
    expect(addCommentIndex).toBeGreaterThan(-1);

    if (doneIndex > -1) {
      expect(addCommentIndex).toBeLessThan(doneIndex);
    }
  });

  it("evidence includes required fields: worktree, changed files, integration sha", () => {
    expect(source).toContain("worktreeId");
    expect(source).toContain("changedFiles");
    expect(source).toContain("integratedMainSha");
  });

  it("does not close issue if cherry-pick fails", () => {
    expect(source).toContain("cherry-pick");
    expect(source).toContain("cherry-pick", "--abort");
    const abortIndex = source.indexOf('"--abort"');
    const doneIndex = source.indexOf("STATES.done");
    expect(abortIndex).toBeGreaterThan(-1);
    expect(doneIndex).toBeGreaterThan(-1);
    expect(abortIndex).toBeLessThan(doneIndex);
  });

  it("records integration result via task-evidence", () => {
    expect(source).toContain("recordIntegrationResult");
  });
});
