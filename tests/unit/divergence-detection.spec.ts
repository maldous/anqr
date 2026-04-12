import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedExecFileSync = vi.fn();

vi.mock("node:child_process", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:child_process")>();
  return {
    ...actual,
    execFileSync: mockedExecFileSync,
  };
});

describe("detectDivergence", () => {
  let detectDivergence: (snapshot: { exists: boolean; path?: string }) => boolean;

  beforeEach(async () => {
    vi.resetModules();
    mockedExecFileSync.mockReset();
    const mod = await import(
      "../../harness/ops/orchestration/symphony-worktree-recovery/detect-divergence.mjs"
    );
    detectDivergence = mod.detectDivergence;
  });

  it("returns false for non-existent snapshot", () => {
    expect(detectDivergence({ exists: false })).toBe(false);
  });

  it("returns false for snapshot without path", () => {
    expect(detectDivergence({ exists: true })).toBe(false);
  });

  it("returns false when origin/main is ancestor of HEAD (not diverged)", () => {
    mockedExecFileSync.mockReturnValueOnce("");
    expect(detectDivergence({ exists: true, path: "/home/user/src/anqr-wt1" })).toBe(false);
    expect(mockedExecFileSync).toHaveBeenCalledWith(
      "git",
      ["merge-base", "--is-ancestor", "origin/main", "HEAD"],
      expect.objectContaining({ cwd: "/home/user/src/anqr-wt1" }),
    );
  });

  it("returns true when origin/main is NOT ancestor of HEAD (diverged)", () => {
    mockedExecFileSync.mockImplementationOnce(() => {
      throw new Error("exit code 1");
    });
    expect(detectDivergence({ exists: true, path: "/home/user/src/anqr-wt1" })).toBe(true);
  });

  it("returns true on git command timeout", () => {
    mockedExecFileSync.mockImplementationOnce(() => {
      throw new Error("ETIMEDOUT");
    });
    expect(detectDivergence({ exists: true, path: "/home/user/src/anqr-wt1" })).toBe(true);
  });
});
