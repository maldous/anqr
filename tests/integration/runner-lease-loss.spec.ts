/**
 * Test: Runner Notification Contract
 *
 * Integration tests verifying that:
 * 1. Lease-loss during validation emits Abandoned (not Done)
 * 2. No-file-change with tool calls moves to In Review (not Done)
 * 3. No-file-change without tool calls moves to Todo (not Done)
 * 4. Success notification is sent AFTER Linear writeback completes
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock: Node builtins
// ---------------------------------------------------------------------------
vi.mock("node:child_process", async (importOriginal) => {
  const orig = await importOriginal<
    typeof import("node:child_process") & { default: Record<string, unknown> }
  >();
  const mocks = { execFileSync: vi.fn(() => "") };
  return { ...orig, ...mocks, default: { ...orig.default, ...mocks } };
});

vi.mock("node:fs", async (importOriginal) => {
  const orig = await importOriginal<
    typeof import("node:fs") & { default: Record<string, unknown> }
  >();
  const mocks = {
    existsSync: vi.fn(() => false),
    readFileSync: vi.fn(() => ""),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
  };
  return { ...orig, ...mocks, default: { ...orig.default, ...mocks } };
});

// ---------------------------------------------------------------------------
// Mock: Harness facade modules
// vi.mock factories are hoisted — cannot reference module-level variables.
// STATES is inlined directly in the factory to avoid ReferenceError.
// ---------------------------------------------------------------------------
vi.mock("../../harness/ops/symphony-state.mjs", () => ({
  acquireLease: vi.fn(),
  releaseLease: vi.fn(),
  heartbeatLease: vi.fn(),
  noteAttemptStart: vi.fn(),
  markRetryExhausted: vi.fn(),
  setCooldown: vi.fn(),
  clearCooldown: vi.fn(),
  getIssueState: vi.fn(),
  recordTransition: vi.fn(),
  patchIssueState: vi.fn(),
  recordCompletion: vi.fn(),
  recordRetryEvent: vi.fn(),
  calculateExponentialBackoff: vi.fn(),
  getFinalizationState: vi.fn(),
  getWorktreeState: vi.fn(),
}));

vi.mock("../../harness/ops/linear-client.mjs", () => ({
  updateIssue: vi.fn(),
  addComment: vi.fn(),
  updateComment: vi.fn(),
  getIssueDetail: vi.fn(),
  STATES: {
    todo: "state-todo",
    inProgress: "state-in-progress",
    inReview: "state-in-review",
    done: "state-done",
    backlog: "state-backlog",
  },
}));

vi.mock("../../harness/ops/symphony-config.mjs", () => ({
  RUNNER_MAX_RETRIES: 5,
  RUNNER_AUTO_PUSH: true,
  RUNNER_MAX_VALIDATION_FIXES: 3,
  RUNNER_VALIDATION_FIX_TURNS: 5,
  RUNNER_ISSUE_COOLDOWN_MS: 300_000,
  RUNNER_VALIDATION_REPAIR_MAX: 3,
  RUNNER_MAX_TURNS: 20,
  RUNNER_MAX_EXECUTION_MS: 1_200_000,
  HEARTBEAT_INTERVAL_MS: 300_000,
  MAX_CONCURRENT_AGENTS: 4,
}));

vi.mock("../../harness/ops/symphony-credit-gate.mjs", () => ({
  recordLinearCompletion: vi.fn(),
  recordProviderSuccess: vi.fn(),
}));

vi.mock("../../harness/ops/core/worktree-config.mjs", () => ({
  isDiscordWorktree: vi.fn(),
}));

vi.mock("../../harness/ops/symphony-agent.mjs", () => ({
  runAgent: vi.fn(),
  continueAgent: vi.fn(),
}));

vi.mock("../../harness/ops/symphony-validation.mjs", () => ({
  runValidation: vi.fn(),
  formatValidationFeedback: vi.fn(),
}));

vi.mock("../../harness/ops/symphony-queue-control.mjs", () => ({
  getQueueSnapshot: vi.fn(),
}));

vi.mock("../../harness/ops/integrations/notifications/openclaw-discord.mjs", () => ({
  sendDiscordEmbed: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mock: Runner-local modules
// ---------------------------------------------------------------------------
vi.mock("../../harness/ops/orchestration/symphony-runner/lease-ttl-ms.mjs", () => ({
  LEASE_TTL_MS: 1_200_000,
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/root.mjs", () => ({
  ROOT: "/mock/root",
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/run-id.mjs", () => ({
  RUN_ID: "test-run-123",
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/sync-failure-threshold.mjs", () => ({
  SYNC_FAILURE_THRESHOLD: 5,
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/sync-fail-count-file.mjs", () => ({
  SYNC_FAIL_COUNT_FILE: "/mock/sync-fail-count",
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/workflow-path.mjs", () => ({
  WORKFLOW_PATH: "/mock/workflow.md",
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/worktree-id.mjs", () => ({
  WORKTREE_ID: "wt-test",
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/classify-provider-failure.mjs", () => ({
  classifyProviderFailure: vi.fn(() => "other"),
}));
vi.mock(
  "../../harness/ops/orchestration/symphony-runner/current-branch-name-for-runner.mjs",
  () => ({ currentBranchNameForRunner: vi.fn(() => "symphony/wt-test") }),
);
vi.mock("../../harness/ops/orchestration/symphony-runner/get-repo-head-sha.mjs", () => ({
  getRepoHeadSha: vi.fn(() => "abc123def456"),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/get-runner-provider.mjs", () => ({
  getRunnerProvider: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/git-commit.mjs", () => ({
  gitCommit: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/git-diff-names.mjs", () => ({
  gitDiffNames: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/git-diff-stat.mjs", () => ({
  gitDiffStat: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/git-push-worktree-branch.mjs", () => ({
  gitPushWorktreeBranch: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/git-revert.mjs", () => ({
  gitRevert: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/release-lock.mjs", () => ({
  releaseLock: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/run-sonar-post-commit.mjs", () => ({
  runSonarPostCommit: vi.fn(),
}));
vi.mock("../../harness/ops/orchestration/symphony-runner/sync-fail-count.mjs", () => ({
  syncFailCount: 0,
  setSyncFailCount: vi.fn(),
}));
vi.mock(
  "../../harness/ops/orchestration/symphony-runner/sync-worktree-before-validation.mjs",
  () => ({ syncWorktreeBeforeValidation: vi.fn() }),
);
vi.mock("../../harness/ops/orchestration/symphony-runner/logger.mjs", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports (all mocked)
// ---------------------------------------------------------------------------
import { executeIssue } from "../../harness/ops/orchestration/symphony-runner/execute-issue.mjs";

import {
  acquireLease,
  heartbeatLease,
  getIssueState,
  getFinalizationState,
  getWorktreeState,
  recordTransition,
} from "../../harness/ops/symphony-state.mjs";
import {
  updateIssue,
  addComment,
  getIssueDetail,
  STATES,
} from "../../harness/ops/linear-client.mjs";
import { recordLinearCompletion } from "../../harness/ops/symphony-credit-gate.mjs";
import { isDiscordWorktree } from "../../harness/ops/core/worktree-config.mjs";
import { runAgent } from "../../harness/ops/symphony-agent.mjs";
import { runValidation } from "../../harness/ops/symphony-validation.mjs";
import { getQueueSnapshot } from "../../harness/ops/symphony-queue-control.mjs";
import { sendDiscordEmbed } from "../../harness/ops/integrations/notifications/openclaw-discord.mjs";
import { getRunnerProvider } from "../../harness/ops/orchestration/symphony-runner/get-runner-provider.mjs";
import { gitDiffNames } from "../../harness/ops/orchestration/symphony-runner/git-diff-names.mjs";
import { gitDiffStat } from "../../harness/ops/orchestration/symphony-runner/git-diff-stat.mjs";
import { gitCommit } from "../../harness/ops/orchestration/symphony-runner/git-commit.mjs";
import { gitRevert } from "../../harness/ops/orchestration/symphony-runner/git-revert.mjs";
import { gitPushWorktreeBranch } from "../../harness/ops/orchestration/symphony-runner/git-push-worktree-branch.mjs";
import { runSonarPostCommit } from "../../harness/ops/orchestration/symphony-runner/run-sonar-post-commit.mjs";
import { syncWorktreeBeforeValidation } from "../../harness/ops/orchestration/symphony-runner/sync-worktree-before-validation.mjs";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------
const fixtures = {
  mockIssue: {
    id: "test-issue-id",
    identifier: "ANQ-TEST-1",
    title: "Test issue for lease-loss",
    priority: 2,
    estimate: 1,
    state: { name: "Todo" },
  },
  agentSuccessResult: {
    completed: true,
    summary: "Implemented the requested changes",
    error: null,
    turns: 3,
    toolCalls: 5,
    filesChanged: ["src/foo.ts"],
    timedOut: false,
    messages: [] as unknown[],
    providerName: "test-provider",
    needsContinuation: false,
  },
};

// ---------------------------------------------------------------------------
// Common setup
// "as never" casts: required for vi.mocked() with untyped .mjs modules
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.resetAllMocks();

  // State module defaults
  vi.mocked(acquireLease).mockReturnValue({ ok: true } as never);
  vi.mocked(heartbeatLease).mockReturnValue({ ok: true } as never);
  vi.mocked(getIssueState).mockReturnValue({ retry_count: 0, notes: {} } as never);
  vi.mocked(getFinalizationState).mockReturnValue(null as never);
  vi.mocked(getWorktreeState).mockReturnValue(null as never);

  // Linear client defaults
  vi.mocked(getIssueDetail).mockResolvedValue({
    id: "test-issue-id",
    identifier: "ANQ-TEST-1",
    title: "Test issue for lease-loss",
    state: { name: "In Progress" },
  } as never);
  vi.mocked(updateIssue).mockResolvedValue(undefined as never);
  vi.mocked(addComment).mockResolvedValue({ id: "mock-comment-id" } as never);

  // Provider
  vi.mocked(getRunnerProvider).mockReturnValue({
    name: "test-provider",
    model: "test-model",
  } as never);

  // Agent
  vi.mocked(runAgent).mockResolvedValue(fixtures.agentSuccessResult as never);

  // Git operations
  vi.mocked(gitDiffNames).mockReturnValue(["src/foo.ts"] as never);
  vi.mocked(gitDiffStat).mockReturnValue("1 file changed" as never);
  vi.mocked(gitCommit).mockReturnValue(true as never);
  vi.mocked(gitPushWorktreeBranch).mockResolvedValue({
    ok: true,
    branch: "symphony/wt-test",
    head: "abc123",
  } as never);
  vi.mocked(gitRevert).mockReturnValue(undefined as never);
  vi.mocked(syncWorktreeBeforeValidation).mockReturnValue({ ok: true } as never);
  vi.mocked(runSonarPostCommit).mockResolvedValue(undefined as never);

  // Validation defaults (passes)
  vi.mocked(runValidation).mockResolvedValue({
    passed: true,
    heartbeatFailed: false,
    results: [{ check: "typecheck", pass: true, detail: "" }],
    signature: null,
  } as never);

  // Discord
  vi.mocked(sendDiscordEmbed).mockResolvedValue({ sent: true } as never);

  // Queue
  vi.mocked(getQueueSnapshot).mockResolvedValue({
    inProgress: { automatable: [] },
    readyDepth: 0,
  } as never);

  // Worktree config
  vi.mocked(isDiscordWorktree).mockReturnValue(false as never);

  // Credit gate
  vi.mocked(recordLinearCompletion).mockReturnValue(undefined as never);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Lease-loss during validation", () => {
  it(
    "emits Abandoned notification, not Done, and writes abandonment to Linear",
    { timeout: 30_000 },
    async () => {
      // Override: validation fails due to heartbeat loss
      vi.mocked(runValidation).mockResolvedValue({
        passed: false,
        heartbeatFailed: true,
        heartbeatDetail: {
          phase: "periodic",
          reason: "lease_mismatch",
          elapsedMs: 5000,
        },
        results: [],
        signature: null,
      } as never);

      const result = await executeIssue(fixtures.mockIssue);
      expect(result).toBe("done");

      // Discord notification must say Abandoned, not Done
      expect(sendDiscordEmbed).toHaveBeenCalled();
      const embedCall = vi.mocked(sendDiscordEmbed).mock.calls[0]![0] as Record<string, unknown>;
      expect(embedCall.title).toContain("Abandoned");
      expect(embedCall.title).not.toContain("Done");
      expect(embedCall.color).toBe(0xff0000);

      // Linear issue moved to Todo, not Done
      const updateCalls = vi.mocked(updateIssue).mock.calls;
      const lastUpdate = updateCalls[updateCalls.length - 1]!;
      expect(lastUpdate[1]).toEqual({ stateId: STATES.todo });
      // Confirm STATES.done was never used
      const anyDone = updateCalls.some(
        (c) => (c[1] as Record<string, unknown>).stateId === STATES.done,
      );
      expect(anyDone).toBe(false);

      // Abandonment comment added to Linear
      const commentCalls = vi.mocked(addComment).mock.calls;
      const lastComment = commentCalls[commentCalls.length - 1]!;
      expect(lastComment[1]).toContain("Run abandoned");
      expect(lastComment[1]).toContain("lease_mismatch");

      // Completion recorded as failure
      expect(recordLinearCompletion).toHaveBeenCalledWith(
        "test-provider",
        expect.objectContaining({ completed: false }),
      );

      // Changes were reverted
      expect(gitRevert).toHaveBeenCalled();

      // Transition reason includes lease-loss detail
      const transitionCalls = vi.mocked(recordTransition).mock.calls;
      const lastTransition = transitionCalls[transitionCalls.length - 1]![1] as Record<
        string,
        unknown
      >;
      expect(lastTransition.reason).toContain("lease_lost_during_validation");
      expect(lastTransition.reason).toContain("lease_mismatch");
    },
  );
});

describe("Lease-loss during execution", () => {
  it(
    "emits Abandoned when heartbeat loses lease during agent execution",
    { timeout: 30_000 },
    async () => {
      // Use fake timers to control the background heartbeat setInterval.
      // Call order: 1st = explicit before runAgent (ok), 2nd = interval during agent (fail).
      // The interval callback sets leaseValid=false, so the check after runAgent aborts.
      vi.useFakeTimers();

      let hbCallCount = 0;
      vi.mocked(heartbeatLease).mockImplementation(() => {
        hbCallCount++;
        if (hbCallCount <= 1) return { ok: true } as never;
        return { ok: false, reason: "lease_mismatch" } as never;
      });

      // runAgent returns a promise that resolves after we advance timers
      let resolveAgent: (v: unknown) => void;
      const agentPromise = new Promise((r) => {
        resolveAgent = r;
      });
      vi.mocked(runAgent).mockReturnValue(agentPromise as never);

      const execPromise = executeIssue(fixtures.mockIssue);

      // Advance time to trigger the heartbeat interval (300_000ms)
      await vi.advanceTimersByTimeAsync(300_000);

      // Now resolve the agent — the !leaseValid check fires next
      resolveAgent!({
        ...fixtures.agentSuccessResult,
        filesChanged: ["src/foo.ts"],
      });

      // Let promises settle
      await vi.advanceTimersByTimeAsync(1);
      vi.useRealTimers();

      const result = await execPromise;
      expect(result).toBe("done");

      // Discord notification must say Abandoned
      expect(sendDiscordEmbed).toHaveBeenCalled();
      const embedCall = vi.mocked(sendDiscordEmbed).mock.calls[0]![0] as Record<string, unknown>;
      expect(embedCall.title).toContain("Abandoned");
      expect(embedCall.color).toBe(0xff0000);

      // Changes were reverted
      expect(gitRevert).toHaveBeenCalled();

      // Completion recorded as failure
      expect(recordLinearCompletion).toHaveBeenCalledWith(
        "test-provider",
        expect.objectContaining({ completed: false }),
      );
    },
  );
});

describe("No-file-change completion hardening", () => {
  it(
    "moves to In Review (not Done) when agent completes with tool calls but no file changes",
    { timeout: 30_000 },
    async () => {
      // Agent reports completion with tool calls but no file changes
      vi.mocked(runAgent).mockResolvedValue({
        ...fixtures.agentSuccessResult,
        toolCalls: 5,
        filesChanged: [],
      } as never);
      vi.mocked(gitDiffNames).mockReturnValue([] as never);

      const result = await executeIssue(fixtures.mockIssue);
      expect(result).toBe("done");

      // Issue moved to In Review, NOT Done
      const updateCalls = vi.mocked(updateIssue).mock.calls;
      const lastUpdate = updateCalls[updateCalls.length - 1]!;
      expect(lastUpdate[1]).toEqual({ stateId: STATES.inReview });

      const anyDone = updateCalls.some(
        (c) => (c[1] as Record<string, unknown>).stateId === STATES.done,
      );
      expect(anyDone).toBe(false);

      // Comment explains why
      const commentCalls = vi.mocked(addComment).mock.calls;
      const lastComment = commentCalls[commentCalls.length - 1]!;
      expect(lastComment[1]).toContain("no file changes");
    },
  );

  it(
    "moves to Todo (not Done) when agent completes with no tool calls and no file changes",
    { timeout: 30_000 },
    async () => {
      // Agent reports completion with zero tool calls and zero file changes
      vi.mocked(runAgent).mockResolvedValue({
        ...fixtures.agentSuccessResult,
        toolCalls: 0,
        filesChanged: [],
      } as never);
      vi.mocked(gitDiffNames).mockReturnValue([] as never);

      const result = await executeIssue(fixtures.mockIssue);
      expect(result).toBe("done");

      // Issue moved to Todo, NOT Done
      const updateCalls = vi.mocked(updateIssue).mock.calls;
      const lastUpdate = updateCalls[updateCalls.length - 1]!;
      expect(lastUpdate[1]).toEqual({ stateId: STATES.todo });

      const anyDone = updateCalls.some(
        (c) => (c[1] as Record<string, unknown>).stateId === STATES.done,
      );
      expect(anyDone).toBe(false);

      // Comment explains why
      const commentCalls = vi.mocked(addComment).mock.calls;
      const lastComment = commentCalls[commentCalls.length - 1]!;
      expect(lastComment[1]).toContain("no file changes");
      expect(lastComment[1]).toContain("no tool calls");
    },
  );
});

describe("Success notification ordering", () => {
  it(
    "sends Discord notification AFTER Linear writeback completes",
    { timeout: 30_000 },
    async () => {
      // Track call ordering
      const callOrder: string[] = [];
      vi.mocked(addComment).mockImplementation(async () => {
        callOrder.push("addComment");
        return { id: "cid" } as never;
      });
      vi.mocked(updateIssue).mockImplementation(async () => {
        callOrder.push("updateIssue");
        return undefined as never;
      });
      vi.mocked(runSonarPostCommit).mockImplementation(async () => {
        callOrder.push("runSonarPostCommit");
        return undefined as never;
      });
      vi.mocked(sendDiscordEmbed).mockImplementation(async () => {
        callOrder.push("sendDiscordEmbed");
        return { sent: true } as never;
      });

      // Full success path: agent succeeds, validation passes, commit + push succeed
      const result = await executeIssue(fixtures.mockIssue);
      expect(result).toBe("done");

      // Discord notification must come after both addComment (completion) and updateIssue (final state)
      const embedIdx = callOrder.lastIndexOf("sendDiscordEmbed");
      expect(embedIdx).toBeGreaterThan(-1);

      // Find the completion comment (the one with "Symphony agent completed")
      const completionCommentIdx = callOrder.indexOf(
        "addComment",
        callOrder.indexOf("addComment") + 1,
      );
      expect(completionCommentIdx).toBeLessThan(embedIdx);

      // Final updateIssue should precede Discord
      const lastUpdateIdx = callOrder.lastIndexOf("updateIssue");
      expect(lastUpdateIdx).toBeLessThan(embedIdx);

      // Sonar should precede Discord
      const sonarIdx = callOrder.lastIndexOf("runSonarPostCommit");
      expect(sonarIdx).toBeLessThan(embedIdx);
    },
  );
});
