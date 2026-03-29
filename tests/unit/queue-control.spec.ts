import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { execFileSync } from "node:child_process";

vi.mock("node:child_process");
vi.mock("../../scripts/ops/lib/logger.mjs", () => ({
  createLogger: () => ({
    logInfo: vi.fn(),
    logError: vi.fn(),
  }),
}));
vi.mock("../../scripts/ops/linear-client.mjs", () => ({
  listIssuesByState: vi.fn().mockResolvedValue([]),
  updateIssue: vi.fn(),
  addComment: vi.fn(),
  STATES: { todo: "todo", backlog: "backlog", inProgress: "inProgress" },
}));
vi.mock("../../scripts/ops/core/symphony-config.mjs", () => ({
  TARGET_MIN: 3,
  TARGET_MAX: 8,
  MAX_CONCURRENT_AGENTS: 4,
  STALE_THRESHOLD_MS: 30 * 60 * 1000,
  TASK_TIMEOUT_MS: 25 * 60 * 1000,
  RECOVERY_GRACE_MS: 10 * 60 * 1000,
  QUEUE_STATES: {
    feedSource: ["Backlog"],
    activeStates: ["In Progress"],
    readyStates: ["Todo"],
  },
}));
vi.mock("../../scripts/ops/core/symphony-state.mjs", () => ({
  canExecuteIssue: vi.fn().mockReturnValue(true),
  canFeedIssue: vi.fn().mockReturnValue(true),
  getIssueState: vi.fn().mockReturnValue({}),
  leaseIsActive: vi.fn().mockReturnValue(false),
  releaseLease: vi.fn(),
  recordTransition: vi.fn(),
  setCooldown: vi.fn(),
}));

describe("symphony-queue-control MAX_CONCURRENT_AGENTS validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should count 0 timers when systemctl returns empty output", async () => {
    const mockExecFileSync = vi.mocked(execFileSync);
    mockExecFileSync.mockReturnValue("");

    const { countEnabledTimers } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../scripts/ops/orchestration/symphony-queue-control.mjs");

    expect(countEnabledTimers()).toBe(0);
  });

  it("should count 2 timers when systemctl returns 2 enabled timers", async () => {
    const mockExecFileSync = vi.mocked(execFileSync);
    mockExecFileSync.mockReturnValue(
      "anqr-symphony-runner@1.timer enabled\nanqr-symphony-runner@2.timer enabled\n",
    );

    const { countEnabledTimers } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../scripts/ops/orchestration/symphony-queue-control.mjs");

    expect(countEnabledTimers()).toBe(2);
  });

  it("should count 4 timers when systemctl returns 4 enabled timers", async () => {
    const mockExecFileSync = vi.mocked(execFileSync);
    mockExecFileSync.mockReturnValue(
      "anqr-symphony-runner@1.timer enabled\n" +
        "anqr-symphony-runner@2.timer enabled\n" +
        "anqr-symphony-runner@3.timer enabled\n" +
        "anqr-symphony-runner@4.timer enabled\n",
    );

    const { countEnabledTimers } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../scripts/ops/orchestration/symphony-queue-control.mjs");

    expect(countEnabledTimers()).toBe(4);
  });

  it("should return 0 when systemctl fails", async () => {
    const mockExecFileSync = vi.mocked(execFileSync);
    mockExecFileSync.mockImplementation(() => {
      throw new Error("systemctl not available");
    });

    const { countEnabledTimers } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../scripts/ops/orchestration/symphony-queue-control.mjs");

    expect(countEnabledTimers()).toBe(0);
  });

  it("should not warn when no timers are enabled", async () => {
    const mockExecFileSync = vi.mocked(execFileSync);
    mockExecFileSync.mockReturnValue("");

    const { validateConcurrencyConfig } =
      // @ts-ignore - No type declarations for .mjs module
      await import("../../scripts/ops/orchestration/symphony-queue-control.mjs");

    // Should not throw or log warnings
    expect(() => validateConcurrencyConfig()).not.toThrow();
  });
});
