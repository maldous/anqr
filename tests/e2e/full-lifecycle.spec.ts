/**
 * E2E: Full lifecycle — Linear issue creation → AI execution → push to main → worktree sync
 *
 * This test exercises the COMPLETE production flow end-to-end:
 *   1. Create a real Linear issue (trivial task: add a comment to a safe file)
 *   2. Enqueue it directly to the desired-work queue (bypasses 10-min reconciler wait)
 *   3. Poll evidence until push.success + integration.mainSha are populated
 *   4. Assert origin/main advanced to the integration SHA
 *   5. Cleanup: revert the main commit and cancel the Linear issue
 *
 * Prerequisites:
 *   - anqr-symphony-scheduler, anqr-symphony-runner@N, anqr-symphony-integrator running
 *   - LINEAR_API_KEY set (via env or ~/.config/systemd/user/anqr-ops.env)
 *   - At least one free worktree slot (wt1–wt4)
 *   - CODEBUFF_API_KEY or OPENROUTER_API_KEY for AI execution
 *
 * WARNING: This test pushes a real commit to origin/main and creates a real Linear issue.
 * Cleanup (revert + cancel) runs in afterAll — mutations are real if cleanup fails.
 *
 * Run:
 *   npx vitest run tests/e2e/full-lifecycle.spec.ts --config vitest.e2e.config.ts
 */

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { findEvidenceByIssue, pollForEvidenceField } from "./e2e-helpers.ts";

// ── Config ────────────────────────────────────────────────────────────────────

const HARNESS_OPS = path.resolve(import.meta.dirname, "../../harness/ops");
const REPO_ROOT = path.resolve(import.meta.dirname, "../../");
const WORKTREE_ROOTS = [1, 2, 3, 4].map((n) => path.resolve(REPO_ROOT, `../anqr-wt${n}`));

const EXECUTION_TIMEOUT_MS = 10 * 60_000;
const POLL_INTERVAL_MS = 3_000;
const VITEST_TIMEOUT_MS = 12 * 60_000;

// ── Harness module loader ─────────────────────────────────────────────────────

async function importHarness() {
  const { createIssue } = await import(`${HARNESS_OPS}/integrations/linear/linear-client/create-issue.mjs`);
  const { updateIssue } = await import(`${HARNESS_OPS}/integrations/linear/linear-client/update-issue.mjs`);
  const { STATES } = await import(`${HARNESS_OPS}/integrations/linear/linear-client/states.mjs`);
  const { listIssuesByState } = await import(`${HARNESS_OPS}/integrations/linear/linear-client/list-issues-by-state.mjs`);
  const { createDurableQueue } = await import(`${HARNESS_OPS}/lib/durable-kv.mjs`);
  return { createIssue, updateIssue, STATES, listIssuesByState, createDurableQueue };
}

// ── Git helpers (no shell — args passed as array to avoid injection) ───────────

function git(cwd: string, ...args: string[]): string {
  const result = spawnSync("git", args, { cwd, encoding: "utf-8" });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed: ${result.stderr}`);
  return result.stdout.trim();
}

// ── Test state ────────────────────────────────────────────────────────────────

let issueId = "";
let issueIdentifier = "";
let integrationSha = "";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Full lifecycle: Linear → AI → push to main → worktree sync", { timeout: VITEST_TIMEOUT_MS }, () => {
    beforeAll(async () => {
      const { createIssue, updateIssue, listIssuesByState, STATES } = await importHarness();

      // Cancel any stale e2e test issues left from previous runs.
      const E2E_TITLE = "E2E: add a code comment to tests/e2e/full-lifecycle.spec.ts";
      const stale = await listIssuesByState(["Todo", "In Progress", "In Review"]);
      for (const si of stale.filter((i: { title: string }) => i.title === E2E_TITLE)) {
        await updateIssue(si.id, { stateId: STATES.canceled });
        console.info(`[full-lifecycle] Cancelled stale e2e issue ${si.identifier}`);
      }

      // Brief pause so Linear state settles before creating the new issue.
      await new Promise((r) => setTimeout(r, 2000));

      // Trivial task — minimises AI cost and execution time.
      // The harness executes this in an isolated worktree.
      const issue = await createIssue({
        title: "E2E: add a code comment to tests/e2e/full-lifecycle.spec.ts",
        description:
          "Add a single-line comment `// e2e-lifecycle-probe` at the top of " +
          "`tests/e2e/full-lifecycle.spec.ts` (below the file-level JSDoc block). " +
          "This is an automated end-to-end test. The change will be reverted after validation.",
        stateId: STATES.todo,
        priority: 1,
      });

      issueId = issue.id;
      issueIdentifier = issue.identifier;
    }, 30_000);

    it("Linear issue was created", () => {
      expect(issueIdentifier).toMatch(/^ANQ-\d+$/);
    });

    it(
      "issue is enqueued into the desired-work queue",
      async () => {
        const { createDurableQueue } = await importHarness();

        // Push directly — bypasses 10-min reconciler backstop
        const queue = createDurableQueue("symphony-desired-work");
        queue.enqueue({
          identifier: issueIdentifier,
          title: "E2E: add a code comment to tests/e2e/full-lifecycle.spec.ts",
          action: "create",
          source: "e2e-test",
          correlationId: `e2e-${issueIdentifier}-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });

        const items: Array<{ identifier: string }> = queue.items();
        expect(items.some((i) => i.identifier === issueIdentifier)).toBe(true);
      },
      30_000,
    );

    it(
      "scheduler creates an evidence record (issue claimed)",
      async () => {
        const deadline = Date.now() + 5 * 60_000;
        let evidence = null;
        while (!evidence && Date.now() < deadline) {
          evidence = findEvidenceByIssue(issueIdentifier);
          if (!evidence) await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
        expect(evidence).not.toBeNull();
        expect(evidence?.ingress?.issueIdentifier).toBe(issueIdentifier);
      },
      6 * 60_000,
    );

    it(
      "AI executes the issue and push evidence is recorded",
      async () => {
        const evidence = await pollForEvidenceField(
          issueIdentifier,
          "push",
          EXECUTION_TIMEOUT_MS,
          POLL_INTERVAL_MS,
        );

        const push = evidence?.push as Record<string, unknown>;
        expect(push?.success).toBe(true);
        expect(typeof push?.branch).toBe("string");
      },
      VITEST_TIMEOUT_MS,
    );

    it(
      "integrator merged branch to main and integration evidence is recorded",
      async () => {
        const evidence = await pollForEvidenceField(
          issueIdentifier,
          "integration",
          // Integration runs right after push — give it 2 extra minutes
          2 * 60_000,
          POLL_INTERVAL_MS,
        );

        const integ = evidence?.integration as Record<string, unknown>;
        expect(integ?.success).toBe(true);
        expect(typeof integ?.mainSha).toBe("string");

        integrationSha = integ.mainSha as string;
      },
      3 * 60_000,
    );

    it("origin/main has advanced to the integration SHA", () => {
      git(REPO_ROOT, "fetch", "origin", "main");
      const remoteMain = git(REPO_ROOT, "rev-parse", "origin/main");
      // The integration SHA must be an ancestor-or-equal of the current origin/main
      // (other integrations may have landed on top)
      const mergeBase = git(REPO_ROOT, "merge-base", remoteMain, integrationSha);
      expect(mergeBase).toBe(integrationSha);
    });

    it("worktrees include integration SHA or will fast-forward on next issue", () => {
      // Worktrees sync lazily at the start of each new issue assignment.
      // We report status but do not fail — lazy sync is by design (ADR-0002).
      let synced = 0;
      for (const wt of WORKTREE_ROOTS) {
        try {
          const wtHead = git(wt, "rev-parse", "HEAD");
          const base = git(wt, "merge-base", wtHead, integrationSha);
          if (base === integrationSha) synced++;
        } catch {
          // worktree may be missing or mid-execution — skip
        }
      }

      console.info(
        `[full-lifecycle] ${synced}/${WORKTREE_ROOTS.length} worktrees already include integration SHA ` +
          `${integrationSha.slice(0, 8)} (remainder sync lazily on next dispatch).`,
      );

      // origin/main is already confirmed above — that's the authoritative proof.
      // This assertion just logs — it never blocks.
      expect(integrationSha).toBeTruthy();
    });
});

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterAll(
  async () => {
    // 1. Revert integration commit from main
    if (integrationSha) {
      try {
        git(REPO_ROOT, "fetch", "origin", "main");
        const currentMain = git(REPO_ROOT, "rev-parse", "origin/main");
        // Only revert if integration SHA is the tip (or reachable ancestor)
        const base = git(REPO_ROOT, "merge-base", currentMain, integrationSha);
        if (base === integrationSha) {
          git(REPO_ROOT, "checkout", "-B", `e2e/revert-${integrationSha.slice(0, 8)}`, "origin/main");
          git(REPO_ROOT, "revert", "--no-edit", integrationSha);
          git(REPO_ROOT, "push", "origin", "HEAD:main");
          console.info(`[full-lifecycle] Reverted ${integrationSha.slice(0, 8)} from origin/main`);
        }
      } catch (err) {
        console.error("[full-lifecycle] Revert failed (manual cleanup required):", err);
      }
    }

    // 2. Cancel the Linear issue
    if (issueId) {
      try {
        const { updateIssue, STATES } = await importHarness();
        await updateIssue(issueId, { stateId: STATES.canceled });
        console.info(`[full-lifecycle] Cancelled Linear issue ${issueIdentifier}`);
      } catch (err) {
        console.error("[full-lifecycle] Failed to cancel Linear issue:", err);
      }
    }
  },
  VITEST_TIMEOUT_MS,
);
