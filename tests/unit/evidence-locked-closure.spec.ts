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

  it("evidence includes required fields: commit sha, worktree, changed files", () => {
    expect(source).toContain("commitSha");
    expect(source).toContain("worktreeId");
    expect(source).toContain("changedFiles");
  });

  it("does not close issue if cherry-pick fails", () => {
    expect(source).toContain("cherry-pick");
    const cherryPickBlock = source.slice(
      source.indexOf("cherry-pick"),
      source.indexOf("cherry-pick") + 500,
    );
    expect(
      cherryPickBlock.includes("return") ||
      cherryPickBlock.includes("continue") ||
      cherryPickBlock.includes("throw"),
    ).toBe(true);
  });

  it("records integration result via task-evidence", () => {
    expect(source).toContain("recordIntegrationResult");
  });
});
